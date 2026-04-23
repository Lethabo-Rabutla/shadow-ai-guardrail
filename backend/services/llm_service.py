from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from models.schemas import ResearchResponse
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

llm = ChatOpenAI(model="gpt-4o-mini")

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

    Return ONLY valid structured output:
    {format_instructions}
    """),
    ("human", "{query}")
]).partial(
    format_instructions=parser.get_format_instructions()
)

chain = prompt | llm | parser


def run_research(query: str):
    try:
        return chain.invoke({"query": query})
    except Exception as e:
        print("Parser failed:", e)

        # fallback response
        return ResearchResponse(
            topic="Unknown",
            summary="Could not parse response",
            sources=[],
            tools_used=[]
        )