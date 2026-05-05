from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from models.schemas import ResearchResponse
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.3,
    max_retries=3,        # 👈 auto retry on failure
    timeout=30,
)

parser = PydanticOutputParser(pydantic_object=ResearchResponse)

prompt = ChatPromptTemplate.from_messages([
    ("system", """
    You are a helpful AI research assistant.
    Your job:
    - Answer any user question clearly and directly.
    - Provide useful, practical information.
    - Do NOT repeat or restate the user's input.
    - Do NOT write generic document-style summaries.
    - Do NOT include filler phrases like "this document outlines".
    - Focus on clarity, correctness, and usefulness.
    Return:
    - topic
    - summary (MUST NOT be empty)
    - sources
    - tools_used
    If the question is ambiguous, infer intent and still provide a helpful answer.
    IMPORTANT: Always return valid structured output. Never return null or empty fields.
    Return ONLY valid structured output:
{format_instructions}
    """),
    ("human", "{query}")
]).partial(
    format_instructions=parser.get_format_instructions()
)

chain = prompt | llm | parser

def run_research(query: str):
    # Try up to 3 times
    for attempt in range(3):
        try:
            result = chain.invoke({"query": query})

            # Make sure summary isn't empty
            if result and result.summary:
                return result

            print(f"Attempt {attempt + 1}: Empty summary, retrying...")

        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")

    # All retries failed — return a clean fallback
    return ResearchResponse(
        topic="General",
        summary="I was unable to generate a response. Please try rephrasing your question.",
        sources=[],
        tools_used=[]
    )