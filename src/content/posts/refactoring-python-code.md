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

Effective refactoring improves code quality, maintainability, and correctness. These principles provide a framework for systematic improvement of Python codebases.

---

# Pythonic Design Principles

## 1. Keep Functions Small and Focused

Functions should do one thing well. Aim for 20–30 lines maximum. When functions grow beyond this, decompose them into smaller, testable units with clear inputs and outputs.

---

## 2. Prioritize Readability Over Cleverness

Python emphasizes readability. Choose explicit code over clever one-liners that obscure intent.

```python
# Avoid
x = [f(a) for a in items if f(a) is not None]

# Prefer explicit loops when clearer
```

---

## 3. Use Pythonic Constructs Appropriately

Leverage built-in features that enhance clarity:

- List comprehensions when they improve readability
- Generators for large datasets or streaming data
- `enumerate()` instead of manual counters
- `zip()` for parallel iteration
- Tuple unpacking: `a, b = pair`

---

## 4. Eliminate Repetition

Extract common patterns into reusable functions or utilities. Repeated logic—whether in Pandas operations, API calls, or validation—should be centralized. Duplication indicates a refactoring opportunity.

---

## 5. Avoid Premature Abstraction

Don't over-engineer. Unnecessary classes, configuration layers, and abstractions add complexity without benefit. Start simple; introduce structure only when complexity demands it.

---

## 6. Handle Exceptions Explicitly

Catch specific exceptions rather than broad `Exception` handlers. Define custom exceptions for domain-specific errors.

```python
# Avoid
except Exception:

# Prefer
except FileNotFoundError:
```

---

# Module and Architecture Principles

## 7. Organize Modules by Responsibility

Structure code according to purpose:

```
project/
  data/
  services/
  api/
  models/
  utils/
```

Each module should have a clear purpose. Avoid monolithic files that mix multiple concerns.

---

## 8. Prefer Functions Over Classes

Not everything needs a class. Use functions, dataclasses, and namedtuples for simple structures. Reserve classes for stateful behavior or domain objects.

---

## 9. Use Dataclasses for Structured Data

Dataclasses reduce boilerplate while improving clarity:

```python
from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str
    email: str
```

---

## 10. Minimize Global State

Global variables complicate debugging, testing, and refactoring. Pass parameters explicitly, use dependency injection, or create configuration objects.

---

## 11. Maintain Module Cohesion

Modules should contain related functionality. High cohesion and low coupling make code easier to maintain and test.

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

---

# Code Quality and Python Idioms

## 12. Follow PEP 8 and Project Conventions

Adhere to style guidelines:

- `snake_case` for variables and functions
- `PascalCase` for classes
- 79–99 character line length
- Type hints per PEP 484

Use tools like `ruff`, `black`, `flake8`, `isort`, and `mypy` to enforce consistency.

---

## 13. Add Type Hints Progressively

Type hints establish contracts and improve IDE support, static analysis, and refactoring safety.

```python
def load_data(path: str) -> list[str]:
    ...
```

Introduce type hints incrementally rather than attempting comprehensive annotation in one pass.

---

## 14. Prefer Pure Functions

Pure functions—without side effects or I/O—are easier to test, reason about, and refactor.

```python
# Stateful
def process(self):
    self.data = transform(self.data)

# Pure
def process(data):
    return transform(data)
```

---

## 15. Use Context Managers

Context managers ensure proper resource management:

```python
with open("file.txt") as f:
    ...
```

Apply to files, locks, database connections, and temporary resources. Create custom context managers with `contextlib.contextmanager` when needed.

---

## 16. Write Clear Docstrings

Document functions using NumPy or Google-style docstrings. Good documentation preserves intent through refactoring cycles.

---

# Refactoring Process Principles

## 17. Refactor with Test Coverage

Before modifying substantial code, establish a safety net:

- Unit tests for core functionality
- Integration tests for major workflows
- Understanding of edge cases

When tests are absent, write characterization tests first to capture current behavior.

---

## 18. Make Incremental Changes

Refactor in small, atomic commits. Each change should represent one conceptual improvement, maintain functionality, and be easily reversible.

---

## 19. Manage Dependencies Systematically

Isolate dependencies using virtual environments. Use `uv` or `poetry` with `pyproject.toml` as the single source of truth. Pin dependency versions for reproducible builds.

---

## 20. Apply the Boy Scout Rule

Leave code cleaner than you found it. Small improvements accumulate:

- Rename unclear variables
- Reorganize imports
- Remove dead code
- Improve error messages

---
