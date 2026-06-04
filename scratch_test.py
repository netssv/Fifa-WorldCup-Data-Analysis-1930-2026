import asyncio
import time
import sys

def trace_calls(frame, event, arg):
    co = frame.f_code
    func_name = co.co_name
    filename = co.co_filename
    if 'bracket_sim' in filename or 'predictions' in filename:
        if event == 'call':
            print(f"-> Call: {func_name} (line {frame.f_lineno} of {filename})", flush=True)
        elif event == 'line':
            print(f"Line {frame.f_lineno} in {func_name} ({filename})", flush=True)
    return trace_calls

sys.settrace(trace_calls)

from api.bracket_sim import simulate_full_bracket

async def main():
    print("Starting simulation test...", flush=True)
    start = time.time()
    try:
        res = await simulate_full_bracket(chaos_factor=0.0, boost_team=None, boost_amount=0.0, sim_runs=1)
        print(f"Simulation completed in {time.time() - start:.3f}s", flush=True)
    except Exception as e:
        print("Error during simulation:", e, flush=True)

asyncio.run(main())
