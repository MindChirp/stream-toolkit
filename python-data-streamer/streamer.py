import sys
import json
import struct
import threading
import re
import socket
import time
import os

# settings_path = "scripts/settings.json"
# settings = json.load(open(settings_path, "r"))

def get_datafiles(basepath):
    settings_path = basepath + "/settings.json"
    settings = json.load(open(settings_path, "r"))
    datafile_paths = []
    datastreams = []
    for device_key in settings:
        for datastream in settings[device_key].values():
            datastreams.append(datastream)
            datafile_paths.append(f"{basepath}/{device_key}/{datastream['id']}.bin")
    return datafile_paths, datastreams

def convert_fstring(fstring):
    pattern = re.compile(r'(\d+)([A-Za-z])')
    return pattern.sub(lambda m: int(m.group(1)) * m.group(2), fstring)

def stream_data_thread(path, stream):
    transmit_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    if not os.path.exists(path):
        print(f"File {path} does not exist")
        return
    elif os.path.getsize(path) == 0:
        print(f"File {path} is empty")
        return
    with open(path, "rb") as file:
        packetlen = struct.calcsize(stream["fstring"])
        data = []
        done = False
        timescale = 1e-6
        try:
            dt = file.read(packetlen)
            ls = struct.unpack(stream["fstring"], file.read(packetlen))
            time_start = time.time()
            ts_index = stream["keys"].index("timestamp")
            data_start = ls[ts_index]
        except Exception as e:
            print(f"Error reading first packet for datastream {stream['id']}. Error: {e}")
            return
        

        while file.readable() and not done:
            # Check if we should wait before sending the next packet
            if time.time() - time_start < (ls[ts_index] - data_start) * timescale:
                time.sleep(0.001)
                continue
            dt = file.read(packetlen)
            if dt == b"":
                done = True
                break
            try:
                last_ts = ls[ts_index]
                ls = struct.unpack(stream["fstring"], dt)
                if ls[ts_index] < last_ts:
                    print(f"Device reset or timestamp overflow for datastream {stream['id']}. Resetting time.")
                    time_start = time.time()
                    data_start = ls[ts_index]
                transmit_socket.sendto(dt, ("localhost", stream["port"]))

            except struct.error:
                print(f"Struct error with data: {dt}")
                break
    

if __name__ == "__main__":

    test_path = sys.argv[1]

    paths, streams = get_datafiles(test_path)
    threads = []
    for path, stream in zip(paths, streams):
        t = threading.Thread(target=stream_data_thread, args=(path, stream), daemon=True)
        t.start()
        threads.append(t)
    time.sleep(1)
    input("Press enter to cancel streaming")
    exit()