import requests
import json
import time

GRAPHQL_URL = "https://leetcode.com/graphql"
HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0",  # some endpoints reject requests with no UA at all
}

LIST_QUERY = """
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
problemsetQuestionList: questionList(
    categorySlug: $categorySlug
    limit: $limit
    skip: $skip
    filters: $filters
) {
    total: totalNum
    questions: data {
    difficulty
    title
    titleSlug
    paidOnly: isPaidOnly
    }
}
}
"""

CONTENT_QUERY = """
query questionContent($titleSlug: String!) {
question(titleSlug: $titleSlug) {
    questionId
    title
    titleSlug
    difficulty
    content
    exampleTestcases
}
}
"""

def fetch_free_problems(difficulty, count):
    payload = {
        "query": LIST_QUERY,
        "variables": {
            "categorySlug": "",
            "skip": 0,
            "limit": count * 3,
            "filters": {"difficulty": difficulty.upper()},
        },
    }
    resp = requests.post(GRAPHQL_URL, json=payload, headers=HEADERS)
    data = resp.json()
    questions = data["data"]["problemsetQuestionList"]["questions"]
    free = [q for q in questions if not q["paidOnly"]]
    return free[:count]

def fetch_content(title_slug, retries=3):
    payload = {"query": CONTENT_QUERY, "variables": {"titleSlug": title_slug}}

    for attempt in range(retries):
        try:
            resp = requests.post(GRAPHQL_URL, json=payload, headers=HEADERS, timeout=10)
            if resp.status_code != 200:
                print(f"  [{title_slug}] status {resp.status_code}, retrying...")
                time.sleep(2 * (attempt + 1))
                continue

            data = resp.json()
            question = data.get("data", {}).get("question")
            if question is None:
                print(f"  [{title_slug}] empty response, retrying...")
                time.sleep(2 * (attempt + 1))
                continue

            return question
        except (requests.exceptions.JSONDecodeError, requests.exceptions.RequestException) as e:
            print(f"  [{title_slug}] error: {e}, retrying...")
            time.sleep(2 * (attempt + 1))

    print(f"  [{title_slug}] FAILED after {retries} attempts, skipping")
    return None

POOL_SIZE_PER_DIFFICULTY = 200

results = []
for diff in ["Easy", "Medium", "Hard"]:
    problems = fetch_free_problems(diff, POOL_SIZE_PER_DIFFICULTY)
    print(f"Fetching {len(problems)} {diff} problems...")

    for i, p in enumerate(problems):
        content = fetch_content(p["titleSlug"])
        if content is None:
            continue  # skip failed ones instead of crashing the whole script

        results.append({
            "title": content["title"],
            "titleSlug": content["titleSlug"],
            "difficulty": content["difficulty"].lower(),
            "leetcodeUrl": f"https://leetcode.com/problems/{content['titleSlug']}/",
        })

        # save progress every 20 problems, in case of a later crash
        if (i + 1) % 20 == 0:
            with open("leetcode_problems.json", "w") as f:
                json.dump(results, f)
            print(f"  ...progress saved ({len(results)} so far)")

        time.sleep(1)  # slower — reduces block risk significantly

with open("leetcode_problems.json", "w") as f:
    json.dump(results, f)

print(f"Done. Saved {len(results)} LeetCode problems to leetcode_problems.json")