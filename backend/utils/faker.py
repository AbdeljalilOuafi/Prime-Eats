#!/usr/bin/env python3
"""faker module"""



from faker import Faker
fake = Faker()

print('Company names')

for _ in range(10):
    print(fake.company())


print('catch phrase:')

for _ in range(10):
    print(fake.catch_phrase())


for _ in range(10):
    print(fake.sentence())

