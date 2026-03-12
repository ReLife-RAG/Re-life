from pymongo import MongoClient
from config.settings import settings

class Database:
    client = None
    db = None

    @classmethod
    def connect(cls):
        if cls.client is None:
            cls.client = MongoClient(settings.MONGODB_URI)
            cls.db = cls.client.get_database()
        return cls.db

    @classmethod
    def get_collection(cls, collection_name: str):
        if cls.db is None:
            cls.connect()
        return cls.db[collection_name]

# Initialize database connection
db = Database.connect()