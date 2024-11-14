from typing import List, Optional
from pydantic import BaseModel
from sqlmodel import Relationship, SQLModel, Field
from sqlalchemy import Column, JSON

# Jobs Table/Schema
class JobBase(SQLModel):
    job_title: str
    required_experience: str
    technologies: List[str] = Field(sa_column=Column(JSON))
    work_type: str
    location: str
    company: str
    required_qualifications: List[str] = Field(sa_column=Column(JSON))
    application_link: str
    job_description: str
    salary_range: str

class JobCreate(JobBase):
    pass

class Jobs(JobBase, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id")
    user: Optional["Users"] = Relationship(back_populates="jobs")


# Users Table/Schema
class UserBase(SQLModel):
    name: str
    email: str
    image: str

class UserCreate(UserBase):
    pass
    
class Users(UserBase, table=True):
    id: int = Field(default=None, primary_key=True)
    jobs: List["Jobs"] = Relationship(back_populates="user")
    
    
# Filters Schema
class Filters(BaseModel):
    job_title: str
    required_experience: Optional[str] = None
    technologies: Optional[List[str]] = None
    work_type: Optional[str] = None
    location: Optional[str] = None
    company: Optional[str] = None 
    salary_range: Optional[str] = None
