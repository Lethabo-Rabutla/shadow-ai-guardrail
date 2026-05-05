from services.db import supabase
from datetime import date

DAILY_LIMIT = 10

def check_rate_limit(user_id: str) -> bool:
    if not user_id:
        return True

    today = str(date.today())

    try:
        result = supabase.table("rate_limits") \
            .select("request_count") \
            .eq("user_id", user_id) \
            .eq("request_date", today) \
            .execute()

        records = result.data

        if not records:
            # First request today
            supabase.table("rate_limits").insert({
                "user_id": user_id,
                "request_date": today,
                "request_count": 1
            }).execute()
            return True

        count = records[0]["request_count"]

        if count >= DAILY_LIMIT:
            return False

        # Increment
        supabase.table("rate_limits").update({
            "request_count": count + 1
        }).eq("user_id", user_id).eq("request_date", today).execute()

        return True

    except Exception as e:
        print("Rate limiter error:", e)
        return True