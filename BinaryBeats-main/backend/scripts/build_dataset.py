import pandas as pd
import requests
import json
import math
from huggingface_hub import HfApi, hf_hub_download

def safe_int(value, default):
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

api = HfApi()
files = api.list_repo_files("DenCT/codeforces-problems-7k", repo_type="dataset")
parquet_files = [f for f in files if f.endswith(".parquet")]
print("Found parquet files:", parquet_files)

if not parquet_files:
    raise Exception("No parquet files found in the dataset repo")

file_path = hf_hub_download(
    repo_id="DenCT/codeforces-problems-7k",
    filename=parquet_files[0],
    repo_type="dataset"
)
df = pd.read_parquet(file_path)
print(f"Loaded {len(df)} rows from Hugging Face dataset")

cf_response = requests.get("https://codeforces.com/api/problemset.problems")
cf_data = cf_response.json()

if cf_data["status"] != "OK":
    raise Exception("Codeforces API request failed")

rating_lookup = {}
for problem in cf_data["result"]["problems"]:
    cid = problem["contestId"]
    if "rating" in problem and cid not in rating_lookup:
        rating_lookup[cid] = problem["rating"]

print(f"Built rating lookup for {len(rating_lookup)} contests")

merged = []
seen = set()
skipped_no_rating = 0
skipped_incomplete = 0
skipped_duplicate = 0

for _, row in df.iterrows():
    contest_id = row["contestId"]
    rating = rating_lookup.get(contest_id)

    if rating is None:
        skipped_no_rating += 1
        continue

    title = row["title"] or row["name"]
    description = row["problem-description"]

    if not title or not description:
        skipped_incomplete += 1
        continue

    dedupe_key = (title, int(contest_id))
    if dedupe_key in seen:
        skipped_duplicate += 1
        continue
    seen.add(dedupe_key)

    merged.append({
        "contestId": int(contest_id),
        "title": title,
        "tags": list(row["tags"]) if row["tags"] is not None else [],
        "timeLimit": safe_int(row["time-limit"], 1),
        "memoryLimit": safe_int(row["memory-limit"], 256),
        "description": description,
        "inputFormat": row["input-specification"] or "",
        "outputFormat": row["output-specification"] or "",
        "demoInput": list(row["demo-input"]) if row["demo-input"] is not None else [],
        "demoOutput": list(row["demo-output"]) if row["demo-output"] is not None else [],
        "testCases": list(row["test_cases"]) if row["test_cases"] is not None else [],
        "rating": int(rating),
    })

with open("problems_merged.json", "w") as f:
    json.dump(merged, f)

print(f"Merged {len(merged)} problems with real ratings")
print(f"Skipped (no matching CF rating): {skipped_no_rating}")
print(f"Skipped (missing title/description): {skipped_incomplete}")
print(f"Skipped (duplicate problem): {skipped_duplicate}")