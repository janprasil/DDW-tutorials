from collections import Counter
from pprint import pprint
import itertools

import pandas as pd


def frequentItems(transactions, support):
    counter = Counter()
    for trans in transactions:
        counter.update(frozenset([t]) for t in trans)
    return set(item for item in counter if counter[item]/len(transactions) >= support), counter

def generateCandidates(L, k):
    candidates = set()
    for a in L:
        for b in L:
            union = a | b
            if len(union) == k and a != b:
                candidates.add(union)
    return candidates

def filterCandidates(transactions, itemsets, support):
    counter = Counter()
    for trans in transactions:
        subsets = [itemset for itemset in itemsets if itemset.issubset(trans)]
        counter.update(subsets)
    return set(item for item in counter if counter[item]/len(transactions) >= support), counter

def apriori(transactions, support):
    result = list()
    resultc = Counter()
    candidates, counter = frequentItems(transactions, support)
    result += candidates
    resultc += counter
    k = 2
    while candidates:
        candidates = generateCandidates(candidates, k)
        candidates,counter = filterCandidates(transactions, candidates, support)
        result += candidates
        resultc += counter
        k += 1
    resultc = {item:(resultc[item]/len(transactions)) for item in resultc}
    return result, resultc


def get_sides(itemset):
    itemlist = list(itemset)
    res = []
    for item in itemlist:
        newlist = list(itemlist)
        newlist.remove(item)
        res.append((newlist, item))
    return res

def generate_confidence(frequent_itemsets):
    candidates = []

    for itemset in frequent_itemsets:
        if len(itemset) < 2:
            continue

        for entry in get_sides(itemset):
            candidates.append((entry, itemset))
    return candidates

def printRules(rules):
    for r in rules[:10]:
        print(f"{r[0]} => {r[1]}: support={r[3]} confidence={r[2]}")

def generate_confidence_rules(entries, supports, min_conf):
    rules = []

    for entry in entries:
        left_side, right_side = entry[0]
        itemset = entry[1]

        r_conf = supports[itemset] / supports[frozenset(left_side)]

        if r_conf >= min_conf:
            rules.append((left_side, right_side, r_conf, supports[itemset]))

    printRules(rules);

def generate_lift_rules(entries, supports, min_conf):
    rules = []

    for entry in entries:
        left_side, right_side = entry[0]
        itemset = entry[1]

        r_conf = supports[itemset] / (supports[frozenset(left_side)] * supports[frozenset([right_side])])

        if r_conf >= min_conf:
            rules.append((left_side, right_side, r_conf, supports[itemset]))

    printRules(rules);

def generate_conviction_rules(entries, supports, min_conf):
    rules = []

    for entry in entries:
        left_side, right_side = entry[0]
        itemset = entry[1]

        r_conf = supports[itemset] / (supports[frozenset(left_side)] * supports[frozenset([right_side])])

        divisor = 1-supports[itemset] / supports[frozenset(left_side)]
        r_conf = (1-supports[frozenset([right_side])]) / (divisor) if divisor else 0

        if r_conf >= min_conf:
            rules.append((left_side, right_side, r_conf, supports[itemset]))

    printRules(rules);

def printAll(entries, supports, min_conf):
    print("CONFIDENCE:")
    generate_confidence_rules(entries, supports, min_conf)
    print("="*120)
    print("LIFT:")
    generate_lift_rules(entries, supports, min_conf)
    print("="*120)
    print("CONVICTION:")
    generate_conviction_rules(entries, supports, min_conf)

#####################################################################################################

df = pd.read_csv("./out/out.csv")
del df["day"]
del df["hour"]
del df["spentTime"]
del df["visitId"]
del df["pageNum"]

dataset = []
for index, row in df.iterrows():
    row = [col+"="+str(row[col]) for col in list(df)]
    dataset.append(row)

frequent_itemsets, supports = apriori(dataset, 0.01)
entries = generate_confidence(frequent_itemsets)

printAll(entries, supports, 0.5)

dataset = []
df = pd.read_csv("./out/topics.csv")
for index, row in df.iterrows():
    newrow = []
    for col in list(df):
        if row[col] == row[col]:
            newrow.append(row[col])
    dataset.append(newrow)

frequent_itemsets, supports = apriori(dataset, 0.01)
entries = generate_confidence(frequent_itemsets)

printAll(entries, supports, 0.5)

