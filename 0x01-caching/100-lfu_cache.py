#!/usr/bin/env python3
"""
LFU Cache module
"""


from base_caching import BaseCaching


class LFUCache(BaseCaching):
    """
    LFUCache is a caching system that inherits from BaseCaching.
    This caching system discards the least frequently used item
    when the cache reaches its limit. If there is a tie in
    usage frequency, the least recently used item is discarded.
    """

    def __init__(self):
        """
        Initialize the cache
        """
        super().__init__()
        self.frequency = {}
        self.order = []

    def put(self, key, item):
        """
        Add an item in the cache
        """
        if key is not None and item is not None:
            if key in self.cache_data:
                self.cache_data[key] = item
                self.frequency[key] += 1
                self.order.remove(key)
            else:
                if len(self.cache_data) >= BaseCaching.MAX_ITEMS:
                    least_used_key = min(self.frequency, key=lambda k: (self.frequency[k], self.order.index(k)))
                    del self.cache_data[least_used_key]
                    del self.frequency[least_used_key]
                    self.order.remove(least_used_key)
                    print("DISCARD: {}".format(least_used_key))
                self.cache_data[key] = item
                self.frequency[key] = 1
            self.order.append(key)

    def get(self, key):
        """
        Get an item by key
        """
        if key in self.cache_data:
            self.frequency[key] += 1
            self.order.remove(key)
            self.order.append(key)
            return self.cache_data[key]
        return None
