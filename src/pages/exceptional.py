
for i in range(99):
    try:
        n=int(input("number:"))
        divide = 50/n
        print("50 divided by", n, "is", divide)

    except ZeroDivisionError:
        print("0 value error")
