# model.py
from typing import Optional, List
from sqlalchemy import ForeignKey, Text
from sqlmodel import Column, Field, Relationship, SQLModel

class OntolModel(SQLModel, table=True):
    __tablename__ = "ontol_model"
    __table_args__ = {"extend_existing": True}

    # 主键：虽然数据库 notnull=0，但作为主键写入时必须非空
    id: str = Field(primary_key=True, sa_column=Column(Text, primary_key=True))
    
    # 自关联外键
    ontol_parent_id: Optional[str] = Field(
        default=None, 
        sa_column=Column(Text, ForeignKey("ontol_model.id", ondelete="NO ACTION"))
    )
    
    # 必填字段 (notnull=1)
    ontol_name: str = Field(sa_column=Column(Text, nullable=False))
    ontol_model_type: str = Field(sa_column=Column(Text, nullable=False))
    ontol_code: str = Field(default="", sa_column=Column(Text, nullable=False)) # 数据库有默认值 ''
    
    # 选填/有默认值字段
    ontol_model_status: str = Field(default="0", sa_column=Column(Text, server_default=text("'0'")))
    ontol_model_desc: Optional[str] = Field(default=None, sa_column=Column(Text))
    create_id: Optional[str] = Field(default=None, sa_column=Column(Text))
    update_id: Optional[str] = Field(default=None, sa_column=Column(Text))
    delete_flag: str = Field(default="0", sa_column=Column(Text, server_default=text("'0'")))

    # 关系
    children: List["OntolModel"] = Relationship(
        back_populates="parent",
        sa_relationship_kwargs={"remote_side": "OntolModel.id"}
    )
    parent: Optional["OntolModel"] = Relationship(back_populates="children")
    attrs: List["OntolModelAttr"] = Relationship(back_populates="model")


class OntolModelAttr(SQLModel, table=True):
    __tablename__ = "ontol_model_attr"
    __table_args__ = {"extend_existing": True}

    id: str = Field(primary_key=True, sa_column=Column(Text, primary_key=True))
    
    # 外键
    ontol_model_id: str = Field(
        sa_column=Column(Text, ForeignKey("ontol_model.id", ondelete="NO ACTION"), nullable=False)
    )
    
    # 必填字段
    attr_name: str = Field(sa_column=Column(Text, nullable=False))
    attr_code: str = Field(sa_column=Column(Text, nullable=False))
    attr_data_type: str = Field(default="0", sa_column=Column(Text, server_default=text("'0'")))
    attr_is_only: str = Field(default="0", sa_column=Column(Text, server_default=text("'0'")))
    attr_required: str = Field(default="0", sa_column=Column(Text, server_default=text("'0'")))
    attr_is_system: str = Field(default="0", sa_column=Column(Text, server_default=text("'0'")))
    delete_flag: str = Field(default="0", sa_column=Column(Text, server_default=text("'0'")))

    # 选填字段
    attr_length: Optional[str] = Field(default=None, sa_column=Column(Text))
    attr_digit: Optional[str] = Field(default=None, sa_column=Column(Text))
    attr_cascade_colum: Optional[str] = Field(default=None, sa_column=Column(Text))
    attr_data_source_flag: Optional[str] = Field(default=None, sa_column=Column(Text))
    attr_data_source: Optional[str] = Field(default=None, sa_column=Column(Text))
    attr_default_value: Optional[str] = Field(default=None, sa_column=Column(Text))
    attr_desc: Optional[str] = Field(default=None, sa_column=Column(Text))
    create_id: Optional[str] = Field(default=None, sa_column=Column(Text))

    # 关系
    model: OntolModel = Relationship(back_populates="attrs")