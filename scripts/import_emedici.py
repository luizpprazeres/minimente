#!/usr/bin/env python3
"""
miniMENTE — eMedici Import Pipeline
- Lê questões de research/emedici/questions/q_*.json
- Classifica via keyword rules no stem + explanation
- Detecta tipo de mídia (ECG, X-ray, CT, foto)
- Importa questions, question_options e explanations no Supabase
- Incremental: pula questões já importadas via source_ref
- Checkpoint automático a cada 1000 questões extraídas

Uso:
  python3 scripts/import_emedici.py             # importa todas disponíveis
  python3 scripts/import_emedici.py --dry-run   # mostra stats sem inserir
  python3 scripts/import_emedici.py --limit 100 # importa primeiras 100
"""

import json
import os
import re
import ssl
import sys
import uuid
import urllib.request
import urllib.error
from html.parser import HTMLParser
from pathlib import Path

ssl._create_default_https_context = ssl._create_unverified_context

SUPABASE_URL = "https://oazaybwijlomlyrlxkjl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hemF5YndpamxvbWx5cmx4a2psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU1MzY0OCwiZXhwIjoyMDkyMTI5NjQ4fQ.WB9PPCHtaNQLWY-E14ZhcYTp4qwbxyzNlyoU6WuEYtQ"

QUESTIONS_DIR = Path(__file__).parent.parent / "research/emedici/questions"
IMPORT_STATE  = Path(__file__).parent.parent / "research/emedici/data/import_state.json"

DRY_RUN = "--dry-run" in sys.argv
LIMIT   = None
for arg in sys.argv:
    if arg.startswith("--limit="):
        LIMIT = int(arg.split("=")[1])

# ── HTML utils ────────────────────────────────────────────────────────────────

class _HTMLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)

    def handle_starttag(self, tag, attrs):
        if tag in ("p", "br", "li", "h1", "h2", "h3", "h4"):
            self.parts.append("\n")

    def get_text(self):
        return re.sub(r"\n{3,}", "\n\n", "".join(self.parts)).strip()


def strip_html(html: str) -> str:
    if not html:
        return ""
    s = _HTMLStripper()
    s.feed(html)
    return s.get_text()


# ── AMC Hierarchy ─────────────────────────────────────────────────────────────
# (identical to import_questions.py — shared source of truth)
AMC_HIERARCHY = {
    "adult_medicine": {
        "name_en": "Adult Medicine", "name_pt": "Medicina do Adulto",
        "weight_pct": 40.0, "icon": "stethoscope", "color_hex": "#2563eb",
        "topics": {
            "cardiology": {
                "name_en": "Cardiology", "name_pt": "Cardiologia",
                "subtopics": ["Ischaemic Heart Disease","Heart Failure","Arrhythmias","Valvular Disease","Hypertension","Pericardial Disease","Cardiomyopathy"],
                "keywords": ["cardiac","heart","coronary","myocardial","angina","arrhythmia","atrial fibrillation","pacemaker","hypertension","ecg","ekg","aortic","mitral","tricuspid","endocarditis","pericarditis","cardiomyopathy","aorta","papillary","ventricular","pericardial"],
            },
            "respiratory": {
                "name_en": "Respiratory Medicine", "name_pt": "Medicina Respiratória",
                "subtopics": ["Asthma & COPD","Pneumonia","Pleural Disease","Pulmonary Embolism","Lung Cancer","Interstitial Lung Disease","Respiratory Failure"],
                "keywords": ["pulmonary","lung","respiratory","asthma","copd","pneumonia","pleural","bronchitis","emphysema","dyspnea","dyspnoea","wheeze","spirometry","tuberculosis","tb","sarcoidosis","embolism","pulmonary hypertension","mesothelioma","breathless","dyspnoe","haemoptysis","hemoptysis","ild","interstitial"],
            },
            "gastroenterology": {
                "name_en": "Gastroenterology", "name_pt": "Gastroenterologia",
                "subtopics": ["Peptic Ulcer Disease","Inflammatory Bowel Disease","Liver Disease","Pancreatic Disease","Colorectal Cancer","GI Bleeding","Malabsorption"],
                "keywords": ["gastric","peptic","ulcer","crohn","colitis","liver","hepatic","cirrhosis","hepatitis","pancreat","bowel","colon","rectum","esophag","oesophag","dysphagia","diarrhea","diarrhoea","constipation","jaundice","biliary","gallstone","cholecyst","spleen","portal hypertension","varices","celiac","coeliac","malabsorption","gi bleed","haematemesis","melena","haematochezia","abdominal pain"],
            },
            "nephrology": {
                "name_en": "Nephrology", "name_pt": "Nefrologia",
                "subtopics": ["Acute Kidney Injury","Chronic Kidney Disease","Glomerulonephritis","Urinary Tract Infection","Electrolyte Disorders","Renal Calculi"],
                "keywords": ["renal","kidney","nephro","glomerul","creatinine","proteinuria","hematuria","haematuria","dialysis","nephrotic","nephritic","aki","ckd","hyponatremia","hypernatremia","hypokalemia","hyperkalemia","acidosis","alkalosis","electrolyte","urinary tract","cystitis","pyelonephritis","renal calculi","kidney stone","dysuria","ureteric"],
            },
            "endocrinology": {
                "name_en": "Endocrinology & Metabolism", "name_pt": "Endocrinologia e Metabolismo",
                "subtopics": ["Diabetes Mellitus","Thyroid Disease","Adrenal Disorders","Pituitary Disorders","Calcium Disorders","Obesity & Metabolic Syndrome"],
                "keywords": ["diabetes","insulin","glucose","thyroid","hypothyroid","hyperthyroid","graves","hashimoto","adrenal","cortisol","cushing","addison","pituitary","acromegaly","prolactin","hypercalcemia","hypocalcemia","hyperparathyroid","hypoparathyroid","obesity","metabolic syndrome","hypoglycemia","ketoacidosis","hba1c","glycated","sglt","metformin","glp-1","dpp-4","sulfonylurea"],
            },
            "haematology": {
                "name_en": "Haematology", "name_pt": "Hematologia",
                "subtopics": ["Anaemia","Bleeding Disorders","Thrombosis & Anticoagulation","Leukaemia & Lymphoma","Myeloma","Haemoglobinopathies"],
                "keywords": ["anemia","anaemia","hemoglobin","haemoglobin","platelet","coagulation","bleeding","thrombocytopenia","leukemia","leukaemia","lymphoma","myeloma","sickle cell","thalassemia","dvt","thrombosis","anticoagulant","warfarin","heparin","iron deficiency","b12","folate","hemophilia","haemophilia","polycythemia","bone marrow","haemolytic","haemolysis","splenomegaly"],
            },
            "neurology": {
                "name_en": "Neurology", "name_pt": "Neurologia",
                "subtopics": ["Stroke","Epilepsy","Headache","Dementia","Movement Disorders","Peripheral Neuropathy","CNS Infections","Multiple Sclerosis"],
                "keywords": ["stroke","seizure","epilepsy","migraine","headache","dementia","alzheimer","parkinson","multiple sclerosis","neuropathy","meningitis","encephalitis","brain","cerebral","spinal cord","lumbar","motor neuron","guillain","myasthenia","peripheral nerve","tremor","ataxia","vertigo","tia","transient ischemic","subarachnoid","lewy body","consciousness","confusion","syncope"],
            },
            "infectious_diseases": {
                "name_en": "Infectious Diseases", "name_pt": "Doenças Infecciosas",
                "subtopics": ["Bacterial Infections","Viral Infections","Fungal Infections","Parasitic Infections","Sepsis","HIV/AIDS","Travel Medicine"],
                "keywords": ["infection","bacterial","virus","viral","fungal","parasit","sepsis","hiv","aids","malaria","typhoid","cholera","dengue","staphylococcus","streptococcus","escherichia","salmonella","clostridium","tuberculosis","syphilis","gonorrhea","chlamydia","herpes","cmv","ebv","influenza","covid","candida","aspergillus","antibiotic","bacteraemia"],
            },
            "rheumatology": {
                "name_en": "Rheumatology & Immunology", "name_pt": "Reumatologia e Imunologia",
                "subtopics": ["Rheumatoid Arthritis","SLE & Connective Tissue","Crystal Arthropathies","Osteoarthritis","Vasculitis","Spondyloarthropathies"],
                "keywords": ["rheumatoid","lupus","sle","arthritis","gout","pseudogout","vasculitis","sjogren","scleroderma","polymyalgia","temporal arteritis","ankylosing","psoriatic arthritis","reactive arthritis","osteoarthritis","joint","synovial","autoimmune","complement","ana","anti-dna","rheumatoid factor","raynaud","giant cell"],
            },
            "dermatology": {
                "name_en": "Dermatology", "name_pt": "Dermatologia",
                "subtopics": ["Eczema & Psoriasis","Skin Infections","Skin Cancer","Blistering Disorders","Hair & Nail Disorders"],
                "keywords": ["skin","dermatitis","eczema","psoriasis","rash","melanoma","basal cell","squamous cell","acne","urticaria","cellulitis","impetigo","tinea","scabies","alopecia","nail","bullous","pemphigus","bullae","erythema","purpura","vitiligo","lentigo","pruritus","sebaceous"],
            },
            "oncology": {
                "name_en": "Oncology", "name_pt": "Oncologia",
                "subtopics": ["Solid Tumours","Haematological Malignancy","Paraneoplastic Syndromes","Cancer Screening","Palliative Care"],
                "keywords": ["cancer","tumor","tumour","malignancy","metastasis","carcinoma","sarcoma","palliative","chemotherapy","radiation","biopsy","staging","paraneoplastic","hepatocellular","renal cell","colorectal cancer","lung cancer","prostate cancer","breast cancer","ovarian cancer","lymph node"],
            },
        }
    },
    "adult_surgery": {
        "name_en": "Adult Surgery", "name_pt": "Cirurgia do Adulto",
        "weight_pct": 15.0, "icon": "scissors", "color_hex": "#dc2626",
        "topics": {
            "general_surgery": {
                "name_en": "General Surgery", "name_pt": "Cirurgia Geral",
                "subtopics": ["Acute Abdomen","Appendicitis","Bowel Obstruction","Hernias","Gallbladder Disease","Abdominal Trauma","Perioperative Care"],
                "keywords": ["appendicitis","hernia","gallbladder","cholecystitis","bowel obstruction","ileus","peritonitis","laparotomy","laparoscop","anastomosis","perioperative","postoperative","surgical wound","abdominal pain surgical","acute abdomen","dumping syndrome","cystic duct","bile duct","cholangitis","cholangiocarcinoma"],
            },
            "vascular_surgery": {
                "name_en": "Vascular Surgery", "name_pt": "Cirurgia Vascular",
                "subtopics": ["Aortic Aneurysm","Peripheral Arterial Disease","Venous Disease","Carotid Disease"],
                "keywords": ["aortic aneurysm","peripheral arterial","claudication","ischemia limb","ischaemia limb","varicose","carotid","vascular graft","aortic dissection","critical limb","ankle brachial","arterial ulcer","venous ulcer","deep vein"],
            },
            "orthopaedics": {
                "name_en": "Orthopaedics & Trauma", "name_pt": "Ortopedia e Trauma",
                "subtopics": ["Fractures","Joint Disorders","Bone Infections","Musculoskeletal Tumours","Spinal Disorders"],
                "keywords": ["fracture","dislocation","orthopedic","orthopaedic","bone","osteomyelitis","osteoporosis","hip replacement","knee","shoulder","back pain","spinal","scoliosis","osteosarcoma","trauma","cast","splint","sling","vertebral","osteoporotic","rotator cuff"],
            },
            "urology": {
                "name_en": "Urology", "name_pt": "Urologia",
                "subtopics": ["Urological Cancers","BPH & Urinary Retention","Renal Calculi","Male Reproductive Disorders","Urological Infections"],
                "keywords": ["prostate","bladder cancer","testicular","bph","urinary retention","nephrolithiasis","ureteral","orchitis","epididymitis","erectile","hydrocele","varicocele","urological","ureteric stent","urostomy","cystoscopy"],
            },
            "ent": {
                "name_en": "ENT", "name_pt": "ORL",
                "subtopics": ["Ear Disorders","Nose & Sinuses","Throat & Larynx","Salivary Glands","Head & Neck Tumours"],
                "keywords": ["ear","hearing","tinnitus","otitis","sinusitis","epistaxis","laryngitis","tonsil","pharyngitis","salivary","parotid","thyroid nodule","neck mass","ent","otolaryngol"],
            },
            "ophthalmology": {
                "name_en": "Ophthalmology", "name_pt": "Oftalmologia",
                "subtopics": ["Acute Vision Loss","Glaucoma","Cataracts","Retinal Disease","Eye Infections"],
                "keywords": ["eye","vision","glaucoma","cataract","retina","cornea","conjunctivitis","optic","ocular","macular","visual acuity","intraocular","uveitis","chalazion","third nerve","ophthalm"],
            },
        }
    },
    "womens_health": {
        "name_en": "Women's Health", "name_pt": "Saúde da Mulher",
        "weight_pct": 15.0, "icon": "heart", "color_hex": "#db2777",
        "topics": {
            "obstetrics": {
                "name_en": "Obstetrics", "name_pt": "Obstetrícia",
                "subtopics": ["Normal Pregnancy & Labour","Antenatal Complications","Intrapartum Complications","Postnatal Care","Hypertensive Disorders of Pregnancy","Gestational Diabetes","Ectopic Pregnancy & Miscarriage"],
                "keywords": ["pregnant","pregnancy","labour","labor","delivery","obstetric","antenatal","prenatal","preeclampsia","eclampsia","gestational","placenta","amniotic","fetal","foetal","caesarean","cesarean","miscarriage","ectopic","postpartum","breastfeed","lactation","gravida","parity","trimester","rupture ectopic"],
            },
            "gynaecology": {
                "name_en": "Gynaecology", "name_pt": "Ginecologia",
                "subtopics": ["Menstrual Disorders","Pelvic Inflammatory Disease","Endometriosis & Fibroids","Gynaecological Cancers","Contraception","Menopause","Vulvovaginal Disorders"],
                "keywords": ["gynecolog","gynaecolog","uterine","cervical","ovarian","endometriosis","fibroid","menstrual","amenorrhea","dysmenorrhea","menopause","contraception","oral contraceptive","iud","pelvic inflammatory","cervicitis","vulvar","vaginal","pap smear","colposcopy","hpv"],
            },
            "breast": {
                "name_en": "Breast", "name_pt": "Mama",
                "subtopics": ["Breast Cancer","Benign Breast Disease","Breast Infection"],
                "keywords": ["breast cancer","mastitis","breast lump","mammogram","fibroadenoma","breast pain","nipple discharge","breast abscess"],
            },
        }
    },
    "child_health": {
        "name_en": "Child Health", "name_pt": "Saúde da Criança",
        "weight_pct": 15.0, "icon": "baby", "color_hex": "#16a34a",
        "topics": {
            "paediatric_medicine": {
                "name_en": "Paediatric Medicine", "name_pt": "Medicina Pediátrica",
                "subtopics": ["Respiratory Infections","Gastroenteritis & Dehydration","Febrile Child","Seizures in Children","Childhood Infections","Immunisation","Developmental Disorders","Genetic Disorders"],
                "keywords": ["child","pediatric","paediatric","infant","toddler","adolescent","juvenile","febrile","immunisation","vaccination","measles","mumps","rubella","chickenpox","whooping cough","croup","bronchiolitis","intussusception","kawasaki","down syndrome","turner","klinefelter","trisomy","cystic fibrosis","year-old boy","year-old girl","months old"],
            },
            "neonatology": {
                "name_en": "Neonatology", "name_pt": "Neonatologia",
                "subtopics": ["Newborn Resuscitation","Prematurity","Neonatal Jaundice","Neonatal Infections","Congenital Anomalies"],
                "keywords": ["newborn","neonate","neonatal","prematurity","premature","apgar","neonatal jaundice","surfactant","patent ductus","necrotizing enterocolitis","congenital heart","sepsis neonatal"],
            },
            "paediatric_surgery": {
                "name_en": "Paediatric Surgery", "name_pt": "Cirurgia Pediátrica",
                "subtopics": ["Congenital GI Anomalies","Paediatric Trauma","Childhood Tumours","Urological Anomalies"],
                "keywords": ["pyloric stenosis","intussusception surgical","hirschsprung","tracheoesophageal","wilms","neuroblastoma","pediatric surgery","paediatric surgery","hypospadias","undescended testis","cryptorchidism"],
            },
            "child_development": {
                "name_en": "Child Development & Behaviour", "name_pt": "Desenvolvimento e Comportamento Infantil",
                "subtopics": ["Developmental Milestones","ADHD & Autism","Child Abuse & Safeguarding","Nutrition & Growth"],
                "keywords": ["developmental milestone","adhd","autism","learning disability","child abuse","safeguarding","neglect","growth chart","failure to thrive","malnutrition child"],
            },
        }
    },
    "mental_health": {
        "name_en": "Mental Health", "name_pt": "Saúde Mental",
        "weight_pct": 10.0, "icon": "brain", "color_hex": "#7c3aed",
        "topics": {
            "psychiatry": {
                "name_en": "Psychiatry", "name_pt": "Psiquiatria",
                "subtopics": ["Mood Disorders","Psychotic Disorders","Anxiety Disorders","Personality Disorders","Eating Disorders","Somatoform Disorders"],
                "keywords": ["depression","bipolar","schizophrenia","psychosis","anxiety","panic disorder","phobia","ocd","ptsd","personality disorder","eating disorder","anorexia","bulimia","somatic","hypochondria","delusional","hallucination","mania","psychiatric","mental health","suicide","self-harm","borderline"],
            },
            "substance_use": {
                "name_en": "Substance Use Disorders", "name_pt": "Transtornos por Uso de Substâncias",
                "subtopics": ["Alcohol Use Disorder","Drug Dependence","Withdrawal Syndromes"],
                "keywords": ["alcohol use","alcoholism","substance abuse","opioid dependence","withdrawal","detoxification","addiction","drug abuse","benzodiazepine dependence","methamphetamine","cocaine addiction"],
            },
            "psychotherapy": {
                "name_en": "Psychotherapy & Management", "name_pt": "Psicoterapia e Manejo",
                "subtopics": ["Cognitive Behavioural Therapy","Pharmacological Management","Mental Health Act & Capacity"],
                "keywords": ["cbt","cognitive behavioral","psychotherapy","antidepressant","ssri","antipsychotic","mood stabilizer","mental health act","capacity","involuntary treatment","lithium psychiatric"],
            },
        }
    },
    "population_health": {
        "name_en": "Population Health", "name_pt": "Saúde Populacional",
        "weight_pct": 5.0, "icon": "globe", "color_hex": "#0891b2",
        "topics": {
            "epidemiology": {
                "name_en": "Epidemiology & Statistics", "name_pt": "Epidemiologia e Estatística",
                "subtopics": ["Study Design","Biostatistics","Screening & Diagnosis","Measures of Disease Frequency"],
                "keywords": ["sensitivity","specificity","positive predictive","negative predictive","odds ratio","relative risk","confidence interval","p-value","randomized controlled","cohort study","case-control","cross-sectional","meta-analysis","systematic review","incidence","prevalence","likelihood ratio","number needed to treat"],
            },
            "preventive_medicine": {
                "name_en": "Preventive Medicine", "name_pt": "Medicina Preventiva",
                "subtopics": ["Immunisation Programs","Cancer Screening","Cardiovascular Prevention","Occupational Health"],
                "keywords": ["screening program","primary prevention","secondary prevention","immunisation program","public health","occupational health","cardiovascular risk","smoking cessation","bowel cancer screening","cervical screening","breast screening","psa screening","surveillance","watchful waiting"],
            },
            "ethics_legal": {
                "name_en": "Ethics & Legal Medicine", "name_pt": "Ética e Medicina Legal",
                "subtopics": ["Informed Consent","Confidentiality","End of Life Care","Medical Negligence"],
                "keywords": ["informed consent","confidentiality","privacy","autonomy","beneficence","non-maleficence","end of life","euthanasia","advance directive","medical negligence","duty of care","capacity","competence","ethics","palliative care","do not resuscitate","dnr"],
            },
            "health_systems": {
                "name_en": "Health Systems", "name_pt": "Sistemas de Saúde",
                "subtopics": ["Australian Health System","Primary Care","Healthcare Quality & Safety","Health Policy"],
                "keywords": ["medicare","health system","gp referral","primary care","hospital system","health policy","quality improvement","clinical governance","patient safety","adverse event","health inequity"],
            },
        }
    },
}

# ── Domain force patterns ──────────────────────────────────────────────────────
DOMAIN_FORCE_PATTERNS = [
    (r"\b(child|infant|pediatric|paediatric|neonate|neonatal|newborn|toddler|adolescent|juvenile|year.old (boy|girl)|\d+ months? old)\b", "child_health"),
    (r"\b(pregnant|pregnancy|gravida|obstetric|labour|labor|antenatal|prenatal|postpartum|gynaecolog|gynecolog|uterine|cervical cancer|ovarian cyst|menstrual|menarche|menopause|vulvar|vaginal discharge|contraception|abortion|miscarriage|ectopic|rupture ectopic)\b", "womens_health"),
    (r"\b(depression|bipolar|schizophrenia|psychosis|anxiety disorder|panic disorder|ocd|ptsd|eating disorder|anorexia|bulimia|personality disorder|suicid|self.harm|psychiatric|mental health|delusional|hallucination)\b", "mental_health"),
    (r"\b(sensitivity|specificity|positive predictive value|negative predictive value|odds ratio|relative risk|confidence interval|number needed to treat|study design|cohort|case.control|randomized controlled|meta.analysis|incidence|prevalence)\b", "population_health"),
]

# ── Media type detection ───────────────────────────────────────────────────────
MEDIA_PATTERNS = [
    ("ecg", r"\b(ecg|ekg|electrocardiog|rhythm strip|cardiac monitor)\b"),
    ("xray", r"\b(x.ray|chest x.ray|xray|radiograph|plain film|cxr|abdominal x.ray)\b"),
    ("ct",   r"\b(ct scan|computed tomography|mri|magnetic resonance|ultrasound|doppler|pet scan)\b"),
    ("photo", r"\b(image shown|photograph|photo|shown above|lesion shown|image above|picture)\b"),
]


def detect_media_type(text: str) -> str:
    for mtype, pattern in MEDIA_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return mtype
    return "none"


# ── Classification ─────────────────────────────────────────────────────────────
def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")


def classify_question(stem: str, explanation: str, learning_points: list) -> tuple:
    """Return (domain_key, topic_key, subtopic_name)."""
    lp_text = " ".join(learning_points or [])
    text = (stem + " " + explanation + " " + lp_text).lower()

    for pattern, domain in DOMAIN_FORCE_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return _pick_topic_in_domain(domain, text)

    best_score = -1
    best = ("adult_medicine", "infectious_diseases", "Bacterial Infections")

    for domain_key, domain in AMC_HIERARCHY.items():
        for topic_key, topic in domain["topics"].items():
            score = sum(1 for kw in topic["keywords"] if kw.lower() in text)
            if score > best_score:
                best_score = score
                subtopic = _pick_subtopic(topic, text)
                best = (domain_key, topic_key, subtopic)

    return best


def _pick_topic_in_domain(domain_key: str, text: str) -> tuple:
    domain = AMC_HIERARCHY[domain_key]
    best_score = -1
    best_topic = list(domain["topics"].keys())[0]
    for topic_key, topic in domain["topics"].items():
        score = sum(1 for kw in topic["keywords"] if kw.lower() in text)
        if score > best_score:
            best_score = score
            best_topic = topic_key
    subtopic = _pick_subtopic(domain["topics"][best_topic], text)
    return (domain_key, best_topic, subtopic)


def _pick_subtopic(topic: dict, text: str) -> str:
    for st in topic["subtopics"]:
        if any(word.lower() in text for word in st.split() if len(word) > 3):
            return st
    return topic["subtopics"][0]


# ── Supabase helpers ───────────────────────────────────────────────────────────
def supa_get(table: str, select: str = "*", filters: dict = None) -> list:
    path = f"{table}?select={select}"
    if filters:
        path += "&" + "&".join(f"{k}={v}" for k, v in filters.items())
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Prefer": "count=none",
    }
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Supabase GET {table} → {e.code}: {e.read().decode()[:300]}")


def supa_upsert(table: str, rows: list, on_conflict: str = None) -> list:
    if not rows:
        return []
    path = table
    if on_conflict:
        path += f"?on_conflict={on_conflict}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation",
    }
    body = json.dumps(rows).encode()
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        if on_conflict and "42P10" in err:
            plain_headers = {**headers, "Prefer": "return=representation"}
            plain_req = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/{table}",
                data=body, headers=plain_headers, method="POST"
            )
            try:
                with urllib.request.urlopen(plain_req) as resp2:
                    return json.loads(resp2.read())
            except urllib.error.HTTPError as e2:
                err2 = e2.read().decode()
                if "23505" in err2:
                    return []
                raise RuntimeError(f"Supabase insert {table} → {e2.code}: {err2[:300]}")
        raise RuntimeError(f"Supabase upsert {table} → {e.code}: {err[:300]}")


# ── Hierarchy setup ────────────────────────────────────────────────────────────
def load_hierarchy() -> dict:
    """Load (or create) the AMC hierarchy and return id_map."""
    print("📚 Carregando hierarquia AMC...")
    id_map = {}

    existing_subjects = supa_get("subjects", select="id,slug")
    existing_subject_slugs = {r["slug"]: r["id"] for r in existing_subjects}

    new_subjects = []
    for i, (domain_key, domain) in enumerate(AMC_HIERARCHY.items()):
        if domain_key in existing_subject_slugs:
            id_map[f"subject:{domain_key}"] = existing_subject_slugs[domain_key]
        else:
            sid = str(uuid.uuid4())
            id_map[f"subject:{domain_key}"] = sid
            new_subjects.append({
                "id": sid, "slug": domain_key,
                "name_en": domain["name_en"], "name_pt": domain["name_pt"],
                "amc_domain": domain_key, "weight_pct": domain["weight_pct"],
                "icon": domain["icon"], "color_hex": domain["color_hex"],
                "sort_order": i,
            })

    if new_subjects and not DRY_RUN:
        result = supa_upsert("subjects", new_subjects, on_conflict="slug")
        for row in result:
            id_map[f"subject:{row['slug']}"] = row["id"]

    print(f"  ✓ subjects: {len(existing_subject_slugs)} existentes + {len(new_subjects)} novos")

    existing_topics = supa_get("topics", select="id,slug,subject_id")
    existing_topic_map = {(r["subject_id"], r["slug"]): r["id"] for r in existing_topics}

    new_topics = []
    sort = 0
    for domain_key, domain in AMC_HIERARCHY.items():
        sid = id_map.get(f"subject:{domain_key}")
        if not sid:
            continue
        for topic_key, topic in domain["topics"].items():
            key = (sid, topic_key)
            if key in existing_topic_map:
                id_map[f"topic:{domain_key}:{topic_key}"] = existing_topic_map[key]
            else:
                tid = str(uuid.uuid4())
                id_map[f"topic:{domain_key}:{topic_key}"] = tid
                new_topics.append({
                    "id": tid, "subject_id": sid, "slug": topic_key,
                    "name_en": topic["name_en"], "name_pt": topic["name_pt"],
                    "sort_order": sort,
                })
            sort += 1

    if new_topics and not DRY_RUN:
        result = supa_upsert("topics", new_topics, on_conflict="subject_id,slug")
        for row in result:
            for dk, domain in AMC_HIERARCHY.items():
                sid = id_map.get(f"subject:{dk}")
                if row["subject_id"] == sid and row["slug"] in domain["topics"]:
                    id_map[f"topic:{dk}:{row['slug']}"] = row["id"]

    print(f"  ✓ topics: {len(existing_topic_map)} existentes + {len(new_topics)} novos")

    existing_subtopics = supa_get("subtopics", select="id,slug,topic_id")
    existing_st_map = {(r["topic_id"], r["slug"]): r["id"] for r in existing_subtopics}

    new_subtopics = []
    sort = 0
    for domain_key, domain in AMC_HIERARCHY.items():
        for topic_key, topic in domain["topics"].items():
            tid = id_map.get(f"topic:{domain_key}:{topic_key}")
            if not tid:
                continue
            for st_name in topic["subtopics"]:
                st_slug = slug(st_name)
                key = (tid, st_slug)
                if key in existing_st_map:
                    id_map[f"subtopic:{domain_key}:{topic_key}:{st_slug}"] = existing_st_map[key]
                else:
                    stid = str(uuid.uuid4())
                    id_map[f"subtopic:{domain_key}:{topic_key}:{st_slug}"] = stid
                    new_subtopics.append({
                        "id": stid, "topic_id": tid, "slug": st_slug,
                        "name_en": st_name, "name_pt": st_name,
                        "sort_order": sort,
                    })
                sort += 1

    if new_subtopics and not DRY_RUN:
        for i in range(0, len(new_subtopics), 100):
            batch = new_subtopics[i:i+100]
            result = supa_upsert("subtopics", batch, on_conflict="topic_id,slug")
            for row in result:
                for key in list(id_map.keys()):
                    if key.startswith("subtopic:") and key.endswith(f":{row['slug']}"):
                        id_map[key] = row["id"]

    print(f"  ✓ subtopics: {len(existing_st_map)} existentes + {len(new_subtopics)} novos")
    return id_map


# ── Import state tracking ──────────────────────────────────────────────────────
def load_import_state() -> set:
    """Return set of eMedici IDs already imported."""
    if IMPORT_STATE.exists():
        with open(IMPORT_STATE) as f:
            data = json.load(f)
            return set(data.get("imported_ids", []))
    return set()


def save_import_state(imported_ids: set):
    IMPORT_STATE.parent.mkdir(parents=True, exist_ok=True)
    with open(IMPORT_STATE, "w") as f:
        json.dump({"imported_ids": sorted(imported_ids)}, f)


# ── Question loader ────────────────────────────────────────────────────────────
def load_questions(already_imported: set) -> list:
    """Load all q_*.json files, skip already imported."""
    files = sorted(QUESTIONS_DIR.glob("q_*.json"), key=lambda p: int(p.stem.split("_")[1]))
    questions = []
    for f in files:
        try:
            with open(f) as fp:
                q = json.load(fp)
            if q.get("id") in already_imported:
                continue
            if q.get("responseType") is None:  # incomplete record
                continue
            questions.append(q)
        except Exception as e:
            print(f"  ⚠ Erro ao ler {f.name}: {e}", file=sys.stderr)

    if LIMIT:
        questions = questions[:LIMIT]

    return questions


# ── Main import ────────────────────────────────────────────────────────────────
def transform_and_import(questions: list, id_map: dict, already_imported: set):
    LABELS = ["A", "B", "C", "D", "E"]
    dist = {}
    media_dist = {}
    all_q_rows, all_opt_rows, all_expl_rows = [], [], []
    new_ids = []

    for q in questions:
        emedici_id = str(q["id"])
        stem_html  = q.get("stem", "")
        stem_q     = q.get("stemQuestion", "")
        stem_full  = f"{strip_html(stem_html)}\n\n{stem_q}".strip()
        expl_html  = q.get("explanation", "")
        expl_text  = strip_html(expl_html)
        options    = q.get("options", [])
        correct_ix = q.get("correctOptions", [0])[0]
        lp         = q.get("learningPoints") or []
        refs       = q.get("references") or []

        domain, topic_key, subtopic_name = classify_question(stem_full, expl_text, lp)
        dist[domain] = dist.get(domain, 0) + 1

        media_type = detect_media_type(stem_full)
        media_dist[media_type] = media_dist.get(media_type, 0) + 1

        subject_id  = id_map.get(f"subject:{domain}")
        topic_id    = id_map.get(f"topic:{domain}:{topic_key}")
        st_slug     = slug(subtopic_name)
        subtopic_id = id_map.get(f"subtopic:{domain}:{topic_key}:{st_slug}")

        if not subject_id:
            print(f"  ⚠ Sem subject para domain={domain}, pulando {emedici_id}", file=sys.stderr)
            continue

        q_id = str(uuid.uuid4())
        new_ids.append(emedici_id)

        all_q_rows.append({
            "id": q_id,
            "subject_id": subject_id,
            "subtopic_id": subtopic_id,
            "amc_domain": domain,
            "stem_en": stem_full,
            "stem_pt": stem_full,        # placeholder até tradução
            "media_type": media_type,
            "media_url": None,
            "difficulty_b": 0.0,         # IRT calibrado futuramente
            "discrimination_a": 1.0,
            "pseudoguessing_c": 0.2,
            "published": True,
            "source_ref": f"EMEDICI:{emedici_id}",
        })

        for i, opt_text in enumerate(options[:5]):
            if i >= len(LABELS):
                break
            all_opt_rows.append({
                "question_id": q_id,
                "label": LABELS[i],
                "text_en": opt_text,
                "text_pt": opt_text,     # placeholder até tradução
                "is_correct": i == correct_ix,
                "distractor_rationale_en": None,
            })

        # reasoning_steps: cada learning point vira um step
        steps = [{"step": i+1, "text": lp_text} for i, lp_text in enumerate(lp)]

        # source_refs: referências bibliográficas do eMedici
        source_refs = [{"source": "eMedici", "ref": r} for r in refs]

        # key_concept: primeiro learning point, ou primeira frase da explanation
        key_concept = lp[0] if lp else (expl_text[:200] if expl_text else None)

        all_expl_rows.append({
            "question_id": q_id,
            "explanation_en": expl_text or "Ver resposta correta.",
            "explanation_pt": expl_text or "Ver resposta correta.",
            "key_concept_en": key_concept,
            "key_concept_pt": key_concept,
            "reasoning_steps": steps,
            "source_refs": source_refs,
            "high_yield_tags": [domain, topic_key],
        })

    # ── Stats ──────────────────────────────────────────────────────────────────
    print(f"\n  Distribuição por domínio AMC:")
    for d, count in sorted(dist.items(), key=lambda x: -x[1]):
        print(f"    {d:<25} {count}")

    print(f"\n  Tipo de mídia detectado:")
    for m, count in sorted(media_dist.items(), key=lambda x: -x[1]):
        print(f"    {m:<10} {count}")

    if DRY_RUN:
        print(f"\n[DRY RUN] {len(all_q_rows)} questões prontas para importar (nenhuma inserida)")
        return

    # ── Insert in batches ──────────────────────────────────────────────────────
    imported = 0
    errors   = 0
    batch_sz = 50

    for i in range(0, len(all_q_rows), batch_sz):
        q_batch   = all_q_rows[i:i+batch_sz]
        q_ids_set = {r["id"] for r in q_batch}
        opt_batch = [r for r in all_opt_rows  if r["question_id"] in q_ids_set]
        exp_batch = [r for r in all_expl_rows if r["question_id"] in q_ids_set]

        try:
            supa_upsert("questions",        q_batch,   on_conflict="source_ref")
            for j in range(0, len(opt_batch), 100):
                supa_upsert("question_options", opt_batch[j:j+100], on_conflict="question_id,label")
            for j in range(0, len(exp_batch), 50):
                supa_upsert("explanations",     exp_batch[j:j+50],  on_conflict="question_id")
            imported += len(q_batch)
        except RuntimeError as e:
            errors += len(q_batch)
            print(f"  ✗ Batch {i//batch_sz + 1} falhou: {e}", file=sys.stderr)
            continue

        if imported % 200 == 0 or imported == len(all_q_rows):
            print(f"  → {imported}/{len(all_q_rows)} importadas...")

        # Salvar checkpoint a cada 500
        if imported % 500 == 0:
            already_imported.update(new_ids[:imported])
            save_import_state(already_imported)

    already_imported.update(new_ids)
    save_import_state(already_imported)
    print(f"\n✅ Concluído: {imported} importadas, {errors} erros")


# ── Entry point ────────────────────────────────────────────────────────────────
def main():
    mode = "DRY RUN" if DRY_RUN else "IMPORT"
    print(f"╔══════════════════════════════════════════════╗")
    print(f"  miniMENTE — eMedici Import Pipeline [{mode}]")
    print(f"╚══════════════════════════════════════════════╝\n")

    already_imported = load_import_state()
    print(f"  IDs já importados: {len(already_imported)}")

    questions = load_questions(already_imported)
    print(f"  Questões para processar: {len(questions)}")

    if not questions:
        print("\nNada novo para importar.")
        return

    id_map = load_hierarchy()

    print(f"\n📥 Transformando e importando {len(questions)} questões...\n")
    transform_and_import(questions, id_map, already_imported)


if __name__ == "__main__":
    main()
