---
title: "Refactoring Python Code"
date: 2025-12-04
description: "Some refactoring principles to follow when optimizing Python code"
tags:
  - "python"
  - "llm"
  - "optimization"
  - "code-quality"
draft: false
---

# Refactoring Principles for Python Projects

A systematic approach to refactoring Python codebases improves readability, maintainability, and correctness. The following principles guide effective refactoring practices.

-----

# Pythonic Design Principles

## 1. Keep Functions Small and Focused

Functions should embody the Single Responsibility Principle, with Python placing particular emphasis on readability. Effective functions perform a single task, exhibit predictable input-output behavior, and are straightforward to test. When a function exceeds approximately 20–30 lines, consider decomposition.

-----

## 2. Prioritize Readability Over Cleverness

The Zen of Python states: "Readability counts." Avoid unnecessarily complex constructs when simpler alternatives exist.

```python
# Avoid
x = [f(a) for a in items if f(a) is not None]

# Prefer explicit loops when clearer
```

-----

## 3. Leverage Pythonic Constructs

Utilize Python's built-in features appropriately:

- List comprehensions when they enhance clarity
- Generators for large datasets or streaming operations
- `enumerate()` rather than manual index counters
- `zip()` for parallel iteration over multiple sequences
- Tuple unpacking: `a, b = pair`

-----

## 4. Eliminate Repetition

Python facilitates code reuse through helper functions, module-level utilities, and shared abstractions. Extract common patterns—repeated Pandas operations, API call sequences, or validation logic—into reusable components. Duplication signals a refactoring opportunity.

-----

## 5. Avoid Premature Abstraction

Resist over-engineering. Unnecessary class hierarchies, excessive configuration layers, and premature abstractions add complexity without value. Prefer simple, flat structures until complexity demands abstraction.

-----

## 6. Handle Exceptions Explicitly

Catch specific exceptions rather than broad `Exception` handlers. Define custom exceptions for domain-specific error conditions.

```python
# Avoid
except Exception:

# Prefer
except FileNotFoundError:
```

-----

# Module and Architecture Principles

## 7. Organize by Responsibility

Structure modules according to their responsibilities:

```
project/
  data/
  services/
  api/
  models/
  utils/
```

Each module should have a well-defined purpose. Avoid monolithic files exceeding 1,000 lines that mix multiple concerns.

-----

## 8. Prefer Functions Over Classes

Python does not require classes for every abstraction. Favor functions, dataclasses, and namedtuples for simple data structures. Reserve classes for scenarios requiring state management, behavior encapsulation, or domain object modeling.

-----

## 9. Use Dataclasses for Data Structures

Dataclasses reduce boilerplate while improving clarity:

```python
from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str
    email: str
```

-----

## 10. Minimize Global State

Global variables complicate debugging, testing, and refactoring. Prefer explicit parameter passing, dependency injection, and configuration objects to manage shared state.

-----

## 11. Maintain Module Cohesion

Modules should contain related functionality. High cohesion and low coupling facilitate maintenance and testing.

**Poor organization:**
```
database.py  
  - SQL connection  
  - File reading  
  - JWT token parsing  
```

**Better organization:**
```
database/
  connection.py  
  queries.py  
  models.py
```

-----

# Code Quality and Python Idioms

## 12. Adhere to PEP 8 and Project Conventions

Follow established style guidelines:

- `snake_case` for variables and functions
- `PascalCase` for classes
- 79–99 character line length
- Type hints per PEP 484

Employ tooling: `ruff`, `black`, `flake8`, `isort`, and `mypy` to enforce consistency.

-----

## 13. Add Type Hints Progressively

Type hints establish function contracts, enabling better IDE support, static analysis, and safer refactoring.

```python
def load_data(path: str) -> list[str]:
    ...
```

Introduce type hints incrementally during refactoring rather than attempting comprehensive annotation in a single pass.

-----

## 14. Prefer Pure Functions

Pure functions—those without side effects or I/O—are easier to test, reason about, and refactor.

```python
# Stateful
def process(self):
    self.data = transform(self.data)

# Pure
def process(data):
    return transform(data)
```

-----

## 15. Use Context Managers

Context managers ensure proper resource management:

```python
with open("file.txt") as f:
    ...
```

Apply to file handles, thread locks, database connections, and temporary resources. Implement custom context managers using `contextlib.contextmanager` when needed.

-----

## 16. Write Clear Docstrings

Document functions using NumPy or Google-style docstrings. Well-written documentation preserves intent and behavior through refactoring cycles.

-----

# Refactoring Process Principles

## 17. Refactor with Test Coverage

Before modifying substantial code blocks, establish a safety net:

- Unit tests covering core functionality
- Integration tests for major workflows
- Understanding of edge cases

When tests are absent, write characterization tests first to capture current behavior.

-----

## 18. Make Incremental Changes

Refactor in small, atomic commits. Each change should represent a single conceptual improvement, maintain system functionality, and be easily reversible.

-----

## 19. Manage Dependencies Systematically

Isolate dependencies using virtual environments. Modern Python projects should use `uv` or `poetry` with `pyproject.toml` as the single source of truth. Pin dependency versions explicitly to ensure reproducible builds.

-----

## 20. Apply the Boy Scout Rule

Leave code cleaner than you found it. Small improvements accumulate:

- Rename unclear variables
- Reorganize imports
- Remove dead code
- Improve error messages

-----

# Advanced Refactoring Techniques

## 21. Replace Conditionals with Polymorphism

Reduce conditional complexity using dispatch mechanisms:

- `functools.singledispatch` for type-based dispatch
- Strategy pattern for algorithm selection
- Pattern matching (`match` statements in Python 3.10+)

-----

## 22. Use Generators for Large Datasets

Generators enable memory-efficient processing of large or streaming data:

```python
def read_lines(path):
    with open(path) as f:
        for line in f:
            yield line
```

-----

## 23. Profile Before Optimizing

Measure performance before refactoring for speed. Use `cProfile`, `line_profiler`, or `memory_profiler` to identify actual bottlenecks. Optimize based on data, not assumptions.

-----
