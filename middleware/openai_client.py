import os

try:
    import openai
except ImportError:
    openai = None

client = None

if openai:
    try:
        openai_base_url = os.getenv("AI_INTEGRATIONS_OPENAI_BASE_URL")
        openai_api_key = os.getenv("AI_INTEGRATIONS_OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY")
        if openai_api_key:
            if openai_base_url:
                client = openai.OpenAI(base_url=openai_base_url, api_key=openai_api_key)
            else:
                client = openai.OpenAI(api_key=openai_api_key)
    except Exception as e:
        client = None
        print(f"⚠️ Failed to initialize OpenAI client: {e}")
