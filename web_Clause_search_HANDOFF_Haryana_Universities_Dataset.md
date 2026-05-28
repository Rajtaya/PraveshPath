# Handoff Notes — Haryana Universities Course/Eligibility Dataset

*Personal notes to self. Last worked: May 2026.*

---

## What this project is

Building an **eligibility-matching engine**: a student enters their profile (10+2 stream/subjects, eventually marks/entrance/category), the engine returns universities + courses in Haryana they're eligible for.

This is *not* a "list every course" project. The point is matching, and the value lives entirely in the **eligibility data quality**, not in course-name coverage.

---

## What's been delivered so far

Two files (same data, two formats):

- `Haryana_Universities_Course_Eligibility.xlsx` — 3 sheets: `Universities`, `Courses_Eligibility`, `READ_ME`
- `haryana_universities_courses.json` — engine-ingestion format, nested: university → courses[]

**Numbers:** 54 universities, 737 course rows, UG + PG.

Build script lives at `build_dataset.py` (regenerates both files; edit the program templates there, not the output files).

---

## The one design decision that matters most

Every course row has a **`data_confidence`** field. This is the backbone of the whole approach — don't lose it:

| Value | Meaning | Engine should... |
|---|---|---|
| `structural` (green) | Program + its **stream requirement** is reliable from standard program structure for that university type | Trust for stream/subject matching |
| `needs-check` (yellow) | University details/program list not confirmed (4 universities) | Show student a "verify on official site" flag, don't assert |

**Why this exists:** stream rules (Engineering→PCM, MBBS/Vet/Agri→PCB, B.Com→Commerce, MBA→any bachelor's) are *stable* and safe to match on. Exact cutoffs/fees/seats/quotas are *not* — they change yearly and aren't in structured form anywhere reliable.

---

## What is and isn't in the data

**Reliable (match on this):**
- Required stream (Science-PCM / Science-PCB / Commerce / Any)
- Required 10+2 subjects
- Level (UG/PG), field, duration

**Deliberately NOT included (do not hard-code later — this was a choice, not an omission):**
- Exact cutoff percentages
- Fees
- Seat counts
- Year-specific quota/reservation rules
- Entrance exam cutoffs

→ Engine design rule: match on stream/subject as the authoritative filter, then route the student to the official prospectus (`Source` column) for the numeric thresholds. Hard-coding those = confidently wrong matches, which is worse than no engine.

---

## Known gaps / loose ends

1. **4 universities flagged `needs-check`**: Sports University of Haryana, Geeta University, Sanskaram University, plus one website-unconfirmed. Need official-site verification.
2. **Course names are templated by university *type*** — broad multi-faculty universities got a standard UG/PG set. Real per-university specializations (e.g. specific B.Tech branches, niche M.A. subjects) not yet captured.
3. **Only stream/subject eligibility** is modeled. Marks / entrance-exam / category-domicile dimensions were explicitly deferred — schema has room but data isn't there.
4. Dataset is a **May 2026 snapshot**. Course catalogs change every admission cycle.

---

## Where to pick up next (priority order)

1. **Resolve the 4 `needs-check` universities** — quick win, removes yellow flags.
2. **Deep-verify one university as a template** — was going to do Kurukshetra or MDU: pull real specializations + current eligibility from the official prospectus, use it as the pattern to progressively upgrade `structural` → `verified`.
3. **Add the marks/entrance/category fields** when ready to expand matching beyond stream — schema already anticipates this.
4. **Set a refresh cadence** — re-verify against official prospectuses each admission cycle; stale eligibility data is the main failure mode.

---

## Mental model if I forget everything else

> Stream/subject = trustworthy, match on it.
> Numbers (marks/fees/seats/quota) = volatile, never hard-code, always defer to official source.
> The `data_confidence` flag is what keeps the engine honest. Protect it.

---

## Source

Primary compiled source was a Jan 2026 aggregated list (AUBSP), cross-checked against uniRank/Shiksha. Always treat each university's official `.ac.in` / official site as the authority for application-time details.
