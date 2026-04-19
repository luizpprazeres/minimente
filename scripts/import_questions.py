#!/usr/bin/env python3
"""
miniMENTE Question Import Pipeline
- Loads 1002 AMBOSS questions
- Creates AMC hierarchy (subjects → topics → subtopics)
- Classifies questions via keyword rules on learning objectives
- Imports questions, options, and explanations into Supabase
"""

import json
import os
import re
import ssl
import sys
import uuid
import urllib.request
import urllib.error
from pathlib import Path

# macOS SSL fix
ssl._create_default_https_context = ssl._create_unverified_context

SUPABASE_URL = "https://oazaybwijlomlyrlxkjl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hemF5YndpamxvbWx5cmx4a2psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU1MzY0OCwiZXhwIjoyMDkyMTI5NjQ4fQ.WB9PPCHtaNQLWY-E14ZhcYTp4qwbxyzNlyoU6WuEYtQ"

QUESTIONS_FILE = Path(__file__).parent.parent / "research/amboss-questions/questions.json"

# ── AMC Hierarchy ─────────────────────────────────────────────────────────────
AMC_HIERARCHY = {
    "adult_medicine": {
        "name_en": "Adult Medicine", "name_pt": "Medicina do Adulto",
        "weight_pct": 40.0, "icon": "stethoscope", "color_hex": "#2563eb",
        "topics": {
            "cardiology": {
                "name_en": "Cardiology", "name_pt": "Cardiologia",
                "subtopics": ["Ischaemic Heart Disease","Heart Failure","Arrhythmias","Valvular Disease","Hypertension","Pericardial Disease","Cardiomyopathy"],
                "keywords": ["cardiac","heart","coronary","myocardial","angina","arrhythmia","atrial fibrillation","pacemaker","hypertension","ecg","ekg","aortic","mitral","tricuspid","endocarditis","pericarditis","cardiomyopathy","aorta"],
            },
            "respiratory": {
                "name_en": "Respiratory Medicine", "name_pt": "Medicina Respiratória",
                "subtopics": ["Asthma & COPD","Pneumonia","Pleural Disease","Pulmonary Embolism","Lung Cancer","Interstitial Lung Disease","Respiratory Failure"],
                "keywords": ["pulmonary","lung","respiratory","asthma","copd","pneumonia","pleural","bronchitis","emphysema","dyspnea","wheeze","spirometry","tuberculosis","tb","sarcoidosis","embolism","pulmonary hypertension","mesothelioma"],
            },
            "gastroenterology": {
                "name_en": "Gastroenterology", "name_pt": "Gastroenterologia",
                "subtopics": ["Peptic Ulcer Disease","Inflammatory Bowel Disease","Liver Disease","Pancreatic Disease","Colorectal Cancer","GI Bleeding","Malabsorption"],
                "keywords": ["gastric","peptic","ulcer","crohn","colitis","liver","hepatic","cirrhosis","hepatitis","pancreat","bowel","colon","rectum","esophag","oesophag","dysphagia","diarrhea","diarrhoea","constipation","jaundice","biliary","gallstone","cholecyst","spleen","portal hypertension","varices","celiac","coeliac","malabsorption","gi bleed","haematemesis","melena"],
            },
            "nephrology": {
                "name_en": "Nephrology", "name_pt": "Nefrologia",
                "subtopics": ["Acute Kidney Injury","Chronic Kidney Disease","Glomerulonephritis","Urinary Tract Infection","Electrolyte Disorders","Renal Calculi"],
                "keywords": ["renal","kidney","nephro","glomerul","creatinine","proteinuria","hematuria","haematuria","dialysis","nephrotic","nephritic","aki","ckd","hyponatremia","hypernatremia","hypokalemia","hyperkalemia","acidosis","alkalosis","electrolyte","urinary tract","cystitis","pyelonephritis","renal calculi","kidney stone"],
            },
            "endocrinology": {
                "name_en": "Endocrinology & Metabolism", "name_pt": "Endocrinologia e Metabolismo",
                "subtopics": ["Diabetes Mellitus","Thyroid Disease","Adrenal Disorders","Pituitary Disorders","Calcium Disorders","Obesity & Metabolic Syndrome"],
                "keywords": ["diabetes","insulin","glucose","thyroid","hypothyroid","hyperthyroid","graves","hashimoto","adrenal","cortisol","cushing","addison","pituitary","acromegaly","prolactin","hypercalcemia","hypocalcemia","hyperparathyroid","hypoparathyroid","obesity","metabolic syndrome","hypoglycemia","ketoacidosis","hba1c","glycated"],
            },
            "haematology": {
                "name_en": "Haematology", "name_pt": "Hematologia",
                "subtopics": ["Anaemia","Bleeding Disorders","Thrombosis & Anticoagulation","Leukaemia & Lymphoma","Myeloma","Haemoglobinopathies"],
                "keywords": ["anemia","anaemia","hemoglobin","haemoglobin","platelet","coagulation","bleeding","thrombocytopenia","leukemia","leukaemia","lymphoma","myeloma","sickle cell","thalassemia","dvt","thrombosis","anticoagulant","warfarin","heparin","iron deficiency","b12","folate","hemophilia","haemophilia","polycythemia","bone marrow"],
            },
            "neurology": {
                "name_en": "Neurology", "name_pt": "Neurologia",
                "subtopics": ["Stroke","Epilepsy","Headache","Dementia","Movement Disorders","Peripheral Neuropathy","CNS Infections","Multiple Sclerosis"],
                "keywords": ["stroke","seizure","epilepsy","migraine","headache","dementia","alzheimer","parkinson","multiple sclerosis","neuropathy","meningitis","encephalitis","brain","cerebral","spinal cord","lumbar","motor neuron","guillain","myasthenia","peripheral nerve","tremor","ataxia","vertigo","tia","transient ischemic"],
            },
            "infectious_diseases": {
                "name_en": "Infectious Diseases", "name_pt": "Doenças Infecciosas",
                "subtopics": ["Bacterial Infections","Viral Infections","Fungal Infections","Parasitic Infections","Sepsis","HIV/AIDS","Travel Medicine"],
                "keywords": ["infection","bacterial","virus","viral","fungal","parasit","sepsis","hiv","aids","malaria","typhoid","cholera","dengue","ebola","staphylococcus","streptococcus","escherichia","salmonella","clostridium","tuberculosis","syphilis","gonorrhea","chlamydia","herpes","cmv","ebv","influenza","covid","hookworm","ascaris","giardia","toxoplasma","candida","aspergillus"],
            },
            "rheumatology": {
                "name_en": "Rheumatology & Immunology", "name_pt": "Reumatologia e Imunologia",
                "subtopics": ["Rheumatoid Arthritis","SLE & Connective Tissue","Crystal Arthropathies","Osteoarthritis","Vasculitis","Spondyloarthropathies"],
                "keywords": ["rheumatoid","lupus","sle","arthritis","gout","pseudogout","vasculitis","sjogren","scleroderma","polymyalgia","temporal arteritis","ankylosing","psoriatic arthritis","reactive arthritis","osteoarthritis","joint","synovial","autoimmune","complement","ana","anti-dna","rheumatoid factor"],
            },
            "dermatology": {
                "name_en": "Dermatology", "name_pt": "Dermatologia",
                "subtopics": ["Eczema & Psoriasis","Skin Infections","Skin Cancer","Blistering Disorders","Hair & Nail Disorders"],
                "keywords": ["skin","dermatitis","eczema","psoriasis","rash","melanoma","basal cell","squamous cell","acne","urticaria","cellulitis","impetigo","tinea","scabies","alopecia","nail","bullous","pemphigus","bullae","erythema","purpura","vitiligo"],
            },
            "oncology": {
                "name_en": "Oncology", "name_pt": "Oncologia",
                "subtopics": ["Solid Tumours","Haematological Malignancy","Paraneoplastic Syndromes","Cancer Screening","Palliative Care"],
                "keywords": ["cancer","tumor","tumour","malignancy","metastasis","carcinoma","sarcoma","palliative","chemotherapy","radiation","biopsy","staging","paraneoplastic"],
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
                "keywords": ["appendicitis","hernia","gallbladder","cholecystitis","bowel obstruction","ileus","peritonitis","laparotomy","laparoscop","anastomosis","perioperative","postoperative","surgical wound","abdominal pain surgical","acute abdomen"],
            },
            "vascular_surgery": {
                "name_en": "Vascular Surgery", "name_pt": "Cirurgia Vascular",
                "subtopics": ["Aortic Aneurysm","Peripheral Arterial Disease","Venous Disease","Carotid Disease"],
                "keywords": ["aortic aneurysm","peripheral arterial","claudication","ischemia limb","varicose","carotid endarterectomy","vascular graft","aortic dissection"],
            },
            "orthopaedics": {
                "name_en": "Orthopaedics & Trauma", "name_pt": "Ortopedia e Trauma",
                "subtopics": ["Fractures","Joint Disorders","Bone Infections","Musculoskeletal Tumours","Spinal Disorders"],
                "keywords": ["fracture","dislocation","orthopedic","orthopaedic","bone","osteomyelitis","osteoporosis","hip replacement","knee","shoulder","back pain","spinal","scoliosis","osteosarcoma","trauma","cast","splint"],
            },
            "urology": {
                "name_en": "Urology", "name_pt": "Urologia",
                "subtopics": ["Urological Cancers","BPH & Urinary Retention","Renal Calculi","Male Reproductive Disorders","Urological Infections"],
                "keywords": ["prostate","bladder cancer","testicular","bph","urinary retention","nephrolithiasis","ureteral","orchitis","epididymitis","erectile","hydrocele","varicocele","urological"],
            },
            "ent": {
                "name_en": "ENT", "name_pt": "ORL",
                "subtopics": ["Ear Disorders","Nose & Sinuses","Throat & Larynx","Salivary Glands","Head & Neck Tumours"],
                "keywords": ["ear","hearing","tinnitus","otitis","sinusitis","epistaxis","laryngitis","tonsil","pharyngitis","salivary","parotid","thyroid nodule","neck mass","ent","otolaryngol"],
            },
            "ophthalmology": {
                "name_en": "Ophthalmology", "name_pt": "Oftalmologia",
                "subtopics": ["Acute Vision Loss","Glaucoma","Cataracts","Retinal Disease","Eye Infections"],
                "keywords": ["eye","vision","glaucoma","cataract","retina","cornea","conjunctivitis","optic","ocular","macular","visual acuity","intraocular","uveitis"],
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
                "keywords": ["pregnant","pregnancy","labour","labor","delivery","obstetric","antenatal","prenatal","preeclampsia","eclampsia","gestational","placenta","amniotic","fetal","foetal","caesarean","cesarean","miscarriage","ectopic","postpartum","breastfeed","lactation","neonate birth","gravida","parity","trimester"],
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
                "keywords": ["child","pediatric","paediatric","infant","toddler","adolescent","juvenile","febrile","immunisation","vaccination","measles","mumps","rubella","chickenpox","whooping cough","croup","bronchiolitis","intussusception","kawasaki","down syndrome","turner","klinefelter","trisomy","cystic fibrosis"],
            },
            "neonatology": {
                "name_en": "Neonatology", "name_pt": "Neonatologia",
                "subtopics": ["Newborn Resuscitation","Prematurity","Neonatal Jaundice","Neonatal Infections","Congenital Anomalies"],
                "keywords": ["newborn","neonate","neonatal","prematurity","premature","apgar","neonatal jaundice","surfactant","respiratory distress syndrome newborn","patent ductus","necrotizing enterocolitis","congenital heart","sepsis neonatal"],
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
                "keywords": ["screening program","primary prevention","secondary prevention","immunisation program","public health","occupational health","cardiovascular risk","smoking cessation","bowel cancer screening","cervical screening","breast screening","psa screening"],
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

# ── Priority rules (checked before keyword matching) ─────────────────────────
# Patterns that force a specific domain
DOMAIN_FORCE_PATTERNS = [
    # child_health — must be checked before adult patterns
    (r"\b(child|infant|pediatric|paediatric|neonate|neonatal|newborn|toddler|adolescent|juvenile|year.old (boy|girl)|months? old)\b", "child_health"),
    # womens_health
    (r"\b(pregnant|pregnancy|gravida|obstetric|labour|labor|antenatal|prenatal|postpartum|gynaecolog|gynecolog|uterine|cervical cancer|ovarian|menstrual|menarche|menopause|vulvar|vaginal discharge|contraception|abortion|miscarriage|ectopic)\b", "womens_health"),
    # mental_health
    (r"\b(depression|bipolar|schizophrenia|psychosis|anxiety disorder|panic disorder|ocd|ptsd|eating disorder|anorexia|bulimia|personality disorder|suicid|self.harm|psychiatric|mental health|delusional|hallucination)\b", "mental_health"),
    # epidemiology
    (r"\b(sensitivity|specificity|positive predictive value|negative predictive value|odds ratio|relative risk|confidence interval|number needed to treat|study design|cohort|case.control|randomized controlled|meta.analysis|incidence|prevalence)\b", "population_health"),
]

def slug(text):
    return re.sub(r'[^a-z0-9]+', '_', text.lower()).strip('_')

def classify_question(q):
    """Rule-based classification using learning objective + stem keywords."""
    text = (q.get("learningObjective", "") + " " + q.get("stem", "")).lower()

    # 1. Force domain by strong patterns
    for pattern, domain in DOMAIN_FORCE_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            # Pick best topic within forced domain
            return _pick_topic_in_domain(domain, text)

    # 2. Score each topic across all domains by keyword matches
    best_score = -1
    best = ("adult_medicine", "infectious_diseases", "Bacterial Infections")

    for domain_key, domain in AMC_HIERARCHY.items():
        for topic_key, topic in domain["topics"].items():
            score = sum(1 for kw in topic["keywords"] if kw.lower() in text)
            if score > best_score:
                best_score = score
                subtopic = _pick_subtopic(topic, text)
                best = (domain_key, topic_key, subtopic)

    # 3. If no match found at all (score=0), default to adult_medicine/infectious_diseases
    return best

def _pick_topic_in_domain(domain_key, text):
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

def _pick_subtopic(topic, text):
    """Pick the most relevant subtopic by name keyword match."""
    for st in topic["subtopics"]:
        if any(word.lower() in text for word in st.split() if len(word) > 3):
            return st
    return topic["subtopics"][0]

# ── Supabase helpers ─────────────────────────────────────────────────────────
def supa_get(table, select="*", filters=None):
    """GET rows from a table."""
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
        err = e.read().decode()
        raise RuntimeError(f"Supabase GET {table} → {e.code}: {err[:300]}")

def supa_upsert(table, rows, on_conflict=None):
    """Upsert rows. Falls back to plain INSERT if no unique constraint exists."""
    if not rows:
        return []
    path = table
    prefer = "resolution=merge-duplicates,return=representation"
    if on_conflict:
        path += f"?on_conflict={on_conflict}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": prefer,
    }
    body = json.dumps(rows).encode()
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        # If on_conflict failed due to missing constraint, retry as plain insert
        if on_conflict and "42P10" in err:
            plain_path = table
            plain_headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            }
            plain_url = f"{SUPABASE_URL}/rest/v1/{plain_path}"
            plain_req = urllib.request.Request(plain_url, data=body, headers=plain_headers, method="POST")
            try:
                with urllib.request.urlopen(plain_req) as resp2:
                    return json.loads(resp2.read())
            except urllib.error.HTTPError as e2:
                err2 = e2.read().decode()
                # Skip duplicate key errors silently
                if "23505" in err2:
                    return []
                raise RuntimeError(f"Supabase insert {table} → {e2.code}: {err2[:300]}")
        raise RuntimeError(f"Supabase upsert {table} → {e.code}: {err[:300]}")

# ── Step 1: Create hierarchy ─────────────────────────────────────────────────
def create_hierarchy():
    print("📚 Loading/creating AMC hierarchy...")
    id_map = {}

    # ── Subjects ──
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

    if new_subjects:
        result = supa_upsert("subjects", new_subjects, on_conflict="slug")
        for row in result:
            id_map[f"subject:{row['slug']}"] = row["id"]

    print(f"  ✓ subjects: {len(existing_subject_slugs)} existing + {len(new_subjects)} new")

    # ── Topics ──
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

    if new_topics:
        result = supa_upsert("topics", new_topics, on_conflict="subject_id,slug")
        for row in result:
            for dk, domain in AMC_HIERARCHY.items():
                sid = id_map.get(f"subject:{dk}")
                if row["subject_id"] == sid and row["slug"] in domain["topics"]:
                    id_map[f"topic:{dk}:{row['slug']}"] = row["id"]

    print(f"  ✓ topics: {len(existing_topic_map)} existing + {len(new_topics)} new")

    # ── Subtopics ──
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

    for i in range(0, len(new_subtopics), 100):
        batch = new_subtopics[i:i+100]
        result = supa_upsert("subtopics", batch, on_conflict="topic_id,slug")
        for row in result:
            for key in list(id_map.keys()):
                if key.startswith("subtopic:") and key.endswith(f":{row['slug']}"):
                    id_map[key] = row["id"]

    print(f"  ✓ subtopics: {len(existing_st_map)} existing + {len(new_subtopics)} new")
    return id_map

# ── Step 2: Import questions ──────────────────────────────────────────────────
def difficulty_to_irt(d):
    return {0: -2.5, 1: -1.5, 2: -0.5, 3: 0.5, 4: 1.5, 5: 2.5}.get(d, 0.0)

def import_questions(questions, id_map):
    print(f"\n📥 Importing {len(questions)} questions...")

    # Count classification distribution
    dist = {}

    all_q_rows = []
    all_opt_rows = []
    all_expl_rows = []

    for q in questions:
        domain, topic_key, subtopic_name = classify_question(q)
        dist[domain] = dist.get(domain, 0) + 1

        subject_id = id_map.get(f"subject:{domain}")
        topic_id = id_map.get(f"topic:{domain}:{topic_key}")
        st_slug = slug(subtopic_name)
        subtopic_id = id_map.get(f"subtopic:{domain}:{topic_key}:{st_slug}")

        if not subject_id:
            print(f"  ⚠ No subject for domain={domain}, skipping {q['id']}")
            continue

        q_id = str(uuid.uuid4())
        difficulty_b = difficulty_to_irt(q.get("difficulty", 2))

        all_q_rows.append({
            "id": q_id,
            "subject_id": subject_id,
            "subtopic_id": subtopic_id,
            "amc_domain": domain,
            "stem_en": q["stem"],
            "difficulty_b": difficulty_b,
            "discrimination_a": 1.0,
            "pseudoguessing_c": 0.2,
            "published": True,
            "source_ref": f"AMBOSS:{q['id']}",
        })

        options = q.get("options", {})
        correct = q.get("correctAnswer", "A")
        explanations = q.get("explanations", {})

        for label in ["A", "B", "C", "D", "E", "F"]:
            if label not in options:
                continue
            # Only A-E are allowed by schema
            if label == "F":
                continue
            all_opt_rows.append({
                "question_id": q_id,
                "label": label,
                "text_en": options[label],
                "is_correct": label == correct,
                "distractor_rationale_en": explanations.get(label) if label != correct else None,
            })

        correct_expl = explanations.get(correct, "")
        all_explanation = "\n\n".join([
            f"**Option {lbl}:** {explanations[lbl]}"
            for lbl in sorted(explanations.keys())
            if lbl in explanations
        ])

        lo = q.get("learningObjective", "")
        all_expl_rows.append({
            "question_id": q_id,
            "explanation_en": all_explanation or correct_expl or "See correct answer.",
            "key_concept_en": lo if lo else None,
            "reasoning_steps": [{"step": 1, "text": correct_expl[:600]}] if correct_expl else [],
            "source_refs": [{"source": "AMBOSS", "ref": q["id"]}],
            "high_yield_tags": [domain, topic_key],
        })

    print(f"\n  Classification distribution:")
    for d, count in sorted(dist.items(), key=lambda x: -x[1]):
        print(f"    {d}: {count}")

    # Insert in batches of 50
    imported = 0
    for i in range(0, len(all_q_rows), 50):
        q_batch = all_q_rows[i:i+50]
        q_ids = {r["id"] for r in q_batch}

        opt_batch = [r for r in all_opt_rows if r["question_id"] in q_ids]
        expl_batch = [r for r in all_expl_rows if r["question_id"] in q_ids]

        try:
            supa_upsert("questions", q_batch, on_conflict="source_ref")
            # Insert options (split into smaller chunks to avoid payload limits)
            for j in range(0, len(opt_batch), 100):
                supa_upsert("question_options", opt_batch[j:j+100], on_conflict="question_id,label")
            for j in range(0, len(expl_batch), 50):
                supa_upsert("explanations", expl_batch[j:j+50], on_conflict="question_id")

            imported += len(q_batch)
            if imported % 200 == 0 or imported == len(all_q_rows):
                print(f"  ✓ {imported}/{len(all_q_rows)} imported")

        except Exception as e:
            print(f"  ✗ Batch {i//50} failed: {e}")

    return imported

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print(f"📖 Loading questions...")
    questions = json.loads(QUESTIONS_FILE.read_text())
    print(f"  {len(questions)} questions loaded\n")

    id_map = create_hierarchy()

    imported = import_questions(questions, id_map)

    print(f"\n✅ Done! {imported}/{len(questions)} questions imported into miniMENTE.")

if __name__ == "__main__":
    main()
