from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from models.schemas import ResearchResponse
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

llm = ChatOpenAI(model="gpt-4o-mini")

parser = PydanticOutputParser(pydantic_object=ResearchResponse)

prompt = ChatPromptTemplate.from_messages([
    ("system", "Return structured output: {format_instructions}"),
    ("human", "{query}")
]).partial(
    format_instructions=parser.get_format_instructions()
)

chain = prompt | llm | parser


def run_research(query: str):
    return chain.invoke({"query": query})