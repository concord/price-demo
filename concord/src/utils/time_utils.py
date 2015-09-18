import time
def time_millis(): return int(round(time.time() * 1000))

def nseconds_from_now_in_millis(sec=1):
    if sec <= 0:
        sec = 1
    return int(time_millis() + (sec * 1000))

def bottom_of_current_second(): return int(time.time())
