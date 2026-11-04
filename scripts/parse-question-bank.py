# -*- coding: utf-8 -*-
"""
把 data/Question Bank 下的两个 docx 题库解析为前端可用的 JSON。

输出：
  public/data/quiz/general.json   通用技术
  public/data/quiz/it.json        信息技术
  public/images/quiz/*.png|jpeg   题目内嵌图片

用法：
  python scripts/parse-question-bank.py
"""
import json
import os
import re
import sys

from docx import Document
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANK_DIR = os.path.join(ROOT, "data", "Question Bank")
OUT_DATA = os.path.join(ROOT, "public", "data", "quiz")
OUT_IMG = os.path.join(ROOT, "public", "images", "quiz")

SUBJECTS = [
    ("general", "通用技术", "通用技术题库.docx"),
    ("it", "信息技术", "信息技术题库.docx"),
]

TYPE_MAP = [
    ("编程填空", "code"),
    ("单项选择", "choice"),
    ("选择", "choice"),
    ("判断", "judge"),
    ("填空", "fill"),
    ("非选择", "answer"),
    ("应用", "answer"),
]

RE_CHAPTER = re.compile(r"^第[一二三四五六七八九十百]+章")
RE_PART = re.compile(r"^第[一二三四五六七八九十百]+部分")
RE_SUBSECTION = re.compile(r"^第[一二三四五六七八九十百]+节")
RE_SECTION = re.compile(r"^[（(]?[一二三四五六七八九十]+[）)、.．]\s*(.+)$")
RE_QUESTION = re.compile(r"^(\d{1,3})\s*[.．、]\s*(\S.*)$")
RE_OPTION = re.compile(r"^([A-DＡ-Ｄ])\s*[.．、]\s*(.*)$")
RE_INLINE_OPTION = re.compile(r"(?=[A-DＡ-Ｄ]\s*[.．、])")
RE_ANSWER = re.compile(r"^【?\s*答案\s*】?\s*[：:]?\s*(.*)$")
RE_EXPLAIN = re.compile(r"^【?\s*(?:详细)?解析\s*】?\s*[：:]?\s*(.*)$")
RE_SUBPART = re.compile(r"^[（(]\s*(\d+)\s*[）)]\s*(.*)$")

FULLWIDTH = str.maketrans({"Ａ": "A", "Ｂ": "B", "Ｃ": "C", "Ｄ": "D", "．": ".", "、": "."})
HEADING_KEYS = ("选择", "判断", "填空", "应用", "非选择", "编程")


def iter_blocks(doc):
    """按文档顺序产出 ('p', 文本, 是否自动编号) / ('img', [图片part])。"""
    for child in doc.element.body.iterchildren():
        if child.tag == qn("w:p"):
            para = Paragraph(child, doc)
            text = para.text.strip()
            ppr = child.pPr
            numbered = ppr is not None and ppr.numPr is not None
            imgs = []
            for blip in child.findall(".//" + qn("a:blip")):
                rid = blip.get(qn("r:embed"))
                if rid and rid in doc.part.related_parts:
                    imgs.append(doc.part.related_parts[rid])
            if imgs:
                yield ("img", imgs)
            if text:
                yield ("p", text, numbered)
        elif child.tag == qn("w:tbl"):
            tbl = Table(child, doc)
            for row in tbl.rows:
                for cell in row.cells:
                    for para in cell.paragraphs:
                        t = para.text.strip()
                        if t:
                            yield ("p", t, False)


def clean_title(text):
    t = re.sub(r"[（(].*?[）)]", "", text)
    t = re.sub(r"\s*(选择题|非选择题|练习题|习题|全套习题|完整版|统一规范排版)\s*$", "", t)
    return t.replace("统一规范排版", "").strip(" 　:：")


def norm_type(section_title, doc_type):
    for key, t in TYPE_MAP:
        if key in section_title:
            return t
    return doc_type


def split_inline_options(text):
    parts = RE_INLINE_OPTION.split(text)
    if len(parts) < 3:
        return text, []
    stem = parts[0].strip()
    options = []
    for chunk in parts[1:]:
        chunk = chunk.strip()
        m = RE_OPTION.match(chunk)
        if m:
            options.append({"key": m.group(1).translate(FULLWIDTH), "text": m.group(2).strip()})
        elif options:
            options[-1]["text"] += " " + chunk
    if [o["key"] for o in options[:4]] == ["A", "B", "C", "D"]:
        return stem, options
    return text, []


def norm_answer(raw):
    s = (raw or "").strip()
    if not s:
        return ""
    if any(k in s for k in ("需结合", "见解析", "无有效答案", "图判定")):
        return ""
    if s in ("√", "对", "正确", "是", "T", "True", "true"):
        return "√"
    if s in ("×", "x", "X", "错", "错误", "否", "F", "False", "false"):
        return "×"
    letters = re.findall(r"[A-D]", s.upper().translate(FULLWIDTH))
    if letters and len(letters) <= 4 and re.fullmatch(r"[A-D\s、，,；;]+", s.upper().translate(FULLWIDTH)):
        return "".join(sorted(set(letters)))
    return s


def finalize(q, subject_id, chapter, subsection, section, seq):
    q["id"] = "%s-%04d" % (subject_id, seq)
    q["subject"] = subject_id
    q["chapter"] = chapter
    q["subsection"] = subsection
    q["section"] = section
    q["number"] = q.pop("_number", 0)

    stem = q.pop("_stem", "").strip()
    stem, inline_options = split_inline_options(stem)
    if inline_options and not q["options"]:
        q["options"] = inline_options
    q["stem"] = stem.strip()

    if not q["options"]:
        _, opts = split_inline_options(q["stem"])
        if opts:
            q["options"] = opts

    answer = norm_answer(q.get("answer", ""))
    q["answerRaw"] = (q.get("answer") or "").strip()
    q["answer"] = answer
    q["explanation"] = (q.get("explanation") or "").strip()

    qtype = q.get("_type") or "choice"
    if answer in ("√", "×"):
        qtype = "judge"
    elif len(q["options"]) >= 2 and answer and all(c in "ABCD" for c in answer):
        qtype = "choice"
    q["type"] = qtype

    if qtype == "choice":
        q["gradable"] = len(q["options"]) >= 2 and bool(answer) and all(c in "ABCD" for c in answer)
    elif qtype == "judge":
        q["gradable"] = answer in ("√", "×")
    elif qtype == "fill":
        q["gradable"] = bool(answer) and len(answer) <= 40
    else:
        q["gradable"] = False

    if not q["stem"] or len(q["stem"]) < 4:
        return None
    return q


def parse_subject(subject_id, name, filename, doc_type):
    path = os.path.join(BANK_DIR, filename)
    doc = Document(path)

    questions = []
    chapter = ""
    subsection = ""
    section_label = ""
    section_type = doc_type
    cur = None
    state = "stem"
    last_part = None
    seq = 0
    img_counter = 0
    images_out = []

    def target():
        if cur and cur["parts"] and last_part is not None:
            return cur["parts"][last_part]
        return cur

    def flush():
        nonlocal cur, state, last_part
        if cur is not None:
            seq_dummy = 0  # noqa: F841
            q = finalize(cur, subject_id, chapter, subsection, section_label, 0)
            if q:
                questions.append(q)
        cur = None
        state = "stem"
        last_part = None

    def start_question(stem, num=0):
        nonlocal cur, state, last_part
        cur = {
            "_stem": stem,
            "_number": num,
            "_type": section_type,
            "options": [],
            "images": [],
            "answer": "",
            "explanation": "",
            "parts": [],
        }
        state = "stem"
        last_part = None

    def has_progress():
        return cur is not None and bool(
            cur["options"] or cur["answer"] or cur["explanation"] or cur["parts"]
        )

    for block in iter_blocks(doc):
        kind = block[0]
        if kind == "img":
            if cur is not None:
                for part in block[1]:
                    img_counter += 1
                    ext = ".jpeg" if part.partname.lower().endswith((".jpg", ".jpeg")) else ".png"
                    fname = "%s-%03d%s" % (subject_id, img_counter, ext)
                    with open(os.path.join(OUT_IMG, fname), "wb") as f:
                        f.write(part.blob)
                    cur["images"].append("/images/quiz/" + fname)
                    images_out.append(fname)
            continue

        _, text, numbered = block

        if RE_CHAPTER.match(text):
            flush()
            chapter = clean_title(text)
            subsection = ""
            continue
        if RE_PART.match(text):
            flush()
            chapter = re.sub(r"第[一二三四五六七八九十百]+节\s*", "", clean_title(text)).strip()
            subsection = ""
            continue
        if RE_SUBSECTION.match(text):
            sub_title = clean_title(text)
            # 文档里章节层级有缺失：同一章内再次出现「第一节」说明进入了新的章
            if chapter and subsection and sub_title.startswith("第一节"):
                flush()
                chapter = sub_title
                subsection = ""
            else:
                flush()
                subsection = sub_title
            continue
        if (
            RE_SECTION.match(text)
            and len(text) < 40
            and any(k in text for k in HEADING_KEYS)
        ):
            flush()
            section_label = text
            section_type = norm_type(text, doc_type)
            continue

        m_ans = RE_ANSWER.match(text)
        if m_ans and cur is not None:
            t = target()
            t["answer"] = ((t.get("answer") or "") + " " + m_ans.group(1).strip()).strip()
            state = "answer"
            continue

        m_exp = RE_EXPLAIN.match(text)
        if m_exp and cur is not None:
            t = target()
            t["explanation"] = ((t.get("explanation") or "") + " " + m_exp.group(1).strip()).strip()
            state = "explanation"
            continue

        m_opt = RE_OPTION.match(text)
        if m_opt and cur is not None and state in ("stem", "options"):
            # 选项可能一行一个，也可能「A.xx B.xx C.xx D.xx」挤在同一段
            for chunk in RE_INLINE_OPTION.split(text):
                chunk = chunk.strip()
                if not chunk:
                    continue
                mm = RE_OPTION.match(chunk)
                if mm:
                    cur["options"].append(
                        {"key": mm.group(1).translate(FULLWIDTH), "text": mm.group(2).strip()}
                    )
                elif cur["options"]:
                    cur["options"][-1]["text"] += " " + chunk
            state = "options"
            continue

        m_sub = RE_SUBPART.match(text)
        if m_sub and cur is not None and section_type in ("fill", "answer", "code"):
            cur["parts"].append({"prompt": text, "answer": "", "explanation": ""})
            last_part = len(cur["parts"]) - 1
            state = "part"
            continue

        m_q = RE_QUESTION.match(text)
        if m_q:
            flush()
            start_question(m_q.group(2).strip(), int(m_q.group(1)))
            continue

        if numbered and state in ("answer", "explanation") and has_progress() and text:
            flush()
            start_question(text)
            continue

        if cur is None:
            continue

        if state == "explanation":
            t = target()
            t["explanation"] = ((t.get("explanation") or "") + "\n" + text).strip()
        elif state == "answer":
            t = target()
            t["answer"] = ((t.get("answer") or "") + "\n" + text).strip()
        elif state == "part":
            t = target()
            t["prompt"] = (t["prompt"] + "\n" + text).strip()
        else:
            cur["_stem"] = (cur["_stem"] + "\n" + text).strip()

    flush()

    # 去重（同一份文档里同题重复出现在多个“全套习题”小节）
    seen = set()
    unique = []
    for q in questions:
        key = re.sub(r"\W+", "", q["stem"])[:90] + "|" + q["answer"]
        if key in seen:
            continue
        seen.add(key)
        unique.append(q)
    questions = unique

    # 重新编号
    for i, q in enumerate(questions, 1):
        q["id"] = "%s-%04d" % (subject_id, i)

    chapters = []
    index = {}
    for q in questions:
        key = q["chapter"] or "未分章"
        if key not in index:
            index[key] = {"title": key, "questions": []}
            chapters.append(index[key])
        index[key]["questions"].append(q)

    return {
        "subject": subject_id,
        "name": name,
        "chapters": chapters,
        "stats": {
            "total": len(questions),
            "gradable": sum(1 for q in questions if q["gradable"]),
            "byType": {
                t: sum(1 for q in questions if q["type"] == t)
                for t in ("choice", "judge", "fill", "answer", "code")
            },
        },
    }, images_out


def main():
    os.makedirs(OUT_DATA, exist_ok=True)
    os.makedirs(OUT_IMG, exist_ok=True)
    report = []
    for subject_id, name, filename in SUBJECTS:
        doc_type = "choice"
        data, imgs = parse_subject(subject_id, name, filename, doc_type)
        out_path = os.path.join(OUT_DATA, subject_id + ".json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        report.append(
            "[%s] %s 题 %d，可判分 %d，分章 %d，图片 %d，题型 %s"
            % (
                subject_id,
                name,
                data["stats"]["total"],
                data["stats"]["gradable"],
                len(data["chapters"]),
                len(imgs),
                data["stats"]["byType"],
            )
        )
        for ch in data["chapters"]:
            report.append("    - %s (%d 题)" % (ch["title"][:44], len(ch["questions"])))
    with open(os.path.join(ROOT, ".tmp_parse_report.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(report))
    print("\n".join(report))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
