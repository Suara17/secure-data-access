from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from typing import List
import uvicorn

# 引入我们刚才写的3个文件
import models
import schemas
from database import engine, get_db

# 1. 自动在数据库创建表（虽然我们已经用SQL建过了，但这行代码能确保连接正常）
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- 这里是你的第一个接口 ---

# 接口功能：获取所有安全等级
# URL地址：http://localhost:8000/security-levels
@app.get("/security-levels", response_model=List[schemas.SecurityLevelBase])
def read_security_levels(db: Session = Depends(get_db)):
    # 逻辑：去数据库查 sys_security_level 表的所有数据
    levels = db.query(models.SecurityLevel).all()
    return levels

# 启动代码
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
