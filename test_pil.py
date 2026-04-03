import sys
try:
    from PIL import Image
    print("PIL is available")
except ImportError:
    print("PIL NOT available")
    sys.exit(1)
