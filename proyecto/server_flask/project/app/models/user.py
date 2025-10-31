class User:
    def __init__(self, id: int, name: str):
        self.id = id
        self.name = name

    def to_dict(self):
        return {"id": self.id, "name": self.name}
