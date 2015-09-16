class Avg:
    def __init__(self):
        self.array = []
        self.count = 0.0
    def avg(self):
        if self.count == 0:
            return 0
        sum(self.array)/self.count
    def append(self, point):
        self.array.append(point)
        self.count = self.count + 1
