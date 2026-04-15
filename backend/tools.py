from langchain_community.tools import DuckDuckGoSearchRun, WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_core.tools import tool
from datetime import datetime


# -----------------------------
# Wikipedia Tool
# -----------------------------
wiki_api = WikipediaAPIWrapper()
wiki_tool = WikipediaQueryRun(api_wrapper=wiki_api)


# -----------------------------
# Web Search Tool
# -----------------------------
search_tool = DuckDuckGoSearchRun()


# -----------------------------
# Custom Tool Example
# -----------------------------
@tool
def current_time() -> str:
    """Returns the current server time."""
    return datetime.now().isoformat()


# -----------------------------
# Export tools list
# -----------------------------
tools = [
    search_tool,
    wiki_tool,
    current_time
]