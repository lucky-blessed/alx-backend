#!/usr/bin/env python3
"""
Deletion-resilient hypermedia pagination
"""

import csv
import math
from typing import List, Dict, Any


class Server:
    """Server class to paginate a database of popular baby names.
    """
    DATA_FILE = "Popular_Baby_Names.csv"

    def __init__(self):
        self.__dataset = None
        self.__indexed_dataset = None

    def dataset(self) -> List[List[Any]]:
        """Cached dataset

        Returns:
            List[List[Any]]: The dataset loaded from the file.
        """
        if self.__dataset is None:
            with open(self.DATA_FILE) as f:
                reader = csv.reader(f)
                dataset = [row for row in reader]
            self.__dataset = dataset[1:]

        return self.__dataset

    def indexed_dataset(self) -> Dict[int, List[Any]]:
        """Dataset indexed by sorting position, starting at 0

        Returns:
            Dict[int, List[Any]]: The indexed dataset.
        """
        if self.__indexed_dataset is None:
            dataset = self.dataset()
            self.__indexed_dataset = {
                i: dataset[i] for i in range(len(dataset))
            }
        return self.__indexed_dataset

    def get_hyper_index(self, index: int = 0, page_size: int = 10) -> Dict[str, Any]:
        """
        Get a dictionary with deletion-resilient pagination details.

        Args:
            index (int): The current start index of the return page.
            page_size (int): The number of items per page.

        Returns:
            Dict[str, Any]: A dictionary containing pagination details.
        """
        assert isinstance(index, int) and index >= 0, "Index must be a non-negative integer."
        assert isinstance(page_size, int) and page_size > 0, "Page size must be a positive integer."

        indexed_data = self.indexed_dataset()
        data = []
        current_index = index
        collected_items = 0

        while collected_items < page_size and current_index < len(indexed_data):
            if current_index in indexed_data:
                data.append(indexed_data[current_index])
                collected_items += 1
            current_index += 1

        next_index = current_index if current_index < len(indexed_data) else None

        return {
            "index": index,
            "next_index": next_index,
            "page_size": len(data),
            "data": data
        }
