# CTS Language Specification

## Overview

Concise Table Schema (CTS) is a domain-specific language for defining database schemas in a compact, readable format. Each construct in CTS is designed to be expressed on a single line, making schemas easy to scan and maintain.

## Language Constructs

### 1. Enums

Enums define a set of valid values for a type. They are declared using the `?` symbol.

**Syntax:**
```
EnumName? value1, value2, value3, ...
```

**Example:**
```
Status? pending, active, inactive, archived
Priority? low, medium, high, critical
```

**Rules:**
- Enum names must be unique within a schema
- Enum values are comma-separated
- Values are case-sensitive
- Enum declarations must appear before any tables that reference them

---

### 2. Tables

Tables are defined using the `>` symbol. The first field in a table definition is always the primary key.

**Syntax:**
```
TableName> Field1, Field2, Field3, ...
```

**Example:**
```
Person> Id%, FirstName, LastName, Email
```

**Rules:**
- Table names must be unique within a schema
- The first field is always the primary key
- Field names are comma-separated
- Table declarations should appear after enum declarations

---

### 3. Field Types

Fields have types indicated by suffix characters. If no suffix is provided, the field is a string.

| Suffix | Type | Description | Example |
|--------|------|-------------|---------|
| (none) | String | Text data | `FirstName` |
| `?` | Boolean | True/false values | `IsActive?` |
| `%` | Long | Integer values | `Count%` |
| `$` | Double | Decimal numbers | `Price$` |
| `#` | Date | Date only | `BirthDate#` |
| `@` | Time | Time only | `StartTime@` |
| `#@` | DateTime | Date and time | `CreatedAt#@` |
| `*` | Blob | Binary data | `Avatar*` |

**Array Types:**

Add `[]` after the type suffix to create an array field.

| Suffix | Type | Example |
|--------|------|---------|
| `[]` | String Array | `Tags[]` |
| `?[]` | Boolean Array | `Flags?[]` |
| `%[]` | Long Array | `Scores%[]` |
| `$[]` | Double Array | `Measurements$[]` |
| `#[]` | Date Array | `Holidays#[]` |
| `@[]` | Time Array | `BreakTimes@[]` |
| `#@[]` | DateTime Array | `Timestamps#@[]` |
| `*[]` | Blob Array | `Attachments*[]` |

**Example:**
```
Project> Id%, Name, Budget$, StartDate#, Milestones#[], Tags[]
```

---

### 4. Field Relationships

#### 4.1 Enum Fields

Reference an enum type using the `~` symbol followed by the enum name.

**Syntax:**
```
FieldName~EnumName
~EnumName              # Field name will be the enum name
```

**Example:**
```
Status? pending, approved, rejected
Document> Id%, Title, Status~Status
Task> Id%, Name, ~Priority
```

#### 4.2 One-to-Many (Parent-Child) Relationships

Create a foreign key to establish a parent-child relationship using `{ParentTable.ParentField`.

**Syntax:**
```
FieldName{ParentTable.ParentField
{ParentTable.ParentField           # Field name will be ParentTable + ParentField
```

**Example:**
```
Category> Id%, Name
Product> Id%, {Category.Id, Title, Price$
Product> Id%, CategoryId{Category.Id, Title, Price$
```

**Rules:**
- Creates a foreign key constraint
- Typically implies CASCADE on update/delete
- Used for one-to-many relationships (one category has many products)
- The parent table must be defined before the child table

#### 4.3 One-to-One (Lookup) Relationships

Create a lookup reference to another table using `~RelatedTable.RelatedField`.

**Syntax:**
```
FieldName~RelatedTable.RelatedField
~RelatedTable.RelatedField          # Field name will be RelatedTable + RelatedField
```

**Example:**
```
User> Id%, Username, Email
Post> Id%, {User.Id, Title, Content, ApprovedBy~User.Id
```

**Rules:**
- Creates a foreign key constraint with SET NULL on delete
- Used for optional references
- Does not imply ownership (unlike parent-child relationships)
- The referenced table must be defined before the referencing table

---

### 5. Lookups (Display Formats)

This section describes an extension to the base CTS language. It is not supported everywhere.

Lookups define how records from a table should be displayed in UI contexts using the `&` symbol.

**Syntax:**
```
TableName& "display format string"
```

**Example:**
```
Person> Id%, FirstName, LastName, Email
Person& "{FirstName} {LastName} ({Email})"

Product> Id%, Code, Name, Price$
Product& "{Code} - {Name}"
```

**Rules:**
- Field names in the format string are enclosed in curly braces
- The display format is enclosed in double quotes
- Multiple lookups can be defined for the same table

---

### 6. Records (Data)

Define initial data to be inserted into tables using the `+` symbol.

**Syntax:**
```
TableName+ value1, value2, value3, ...|variableName
TableName+ value1, value2, value3, ...
```

**Example:**
```
Category+ Electronics|electronics
Category+ Books|books
Product+ [electronics], Laptop, 999.99
Product+ [books], CTS Guide, 29.99
```

**Special Syntax:**
- `|variableName` - Captures the primary key of the inserted record
- `[variableName]` - References a previously captured primary key
- Field values are comma-separated
- Values match the field order from the table definition (excluding the primary key)

**Rules:**
- Records should be defined after all table and lookup definitions
- Parent records must be defined before child records when using variables
- String values with special characters should be quoted
- Date values follow the format: `YYYY-MM-DD`
- DateTime values follow the format: `YYYY-MM-DD HH:MM:SS`
- Time values follow the format: `HH:MM:SS`

---

### 7. Annotations

This section describes an extension to the base CTS language. It is not supported everywhere.

Annotations provide metadata about the schema at three levels: system, table, and field.

#### 7.1 System Annotations

Apply to the entire schema using the `@` symbol with no prefix.

**Syntax:**
```
AnnotationName@ value
```

**Example:**
```
Version@ 1.0.0
Author@ John Doe
DatabaseEngine@ postgres
```

#### 7.2 Table Annotations

Apply to specific tables using `TableName.AnnotationName@`.

**Syntax:**
```
TableName.AnnotationName@ value
```

**Example:**
```
Person> Id%, FirstName, LastName
Person.Description@ Stores information about people
Person.DisplayName@ People
```

#### 7.3 Field Annotations

Apply to specific fields using `TableName.FieldName.AnnotationName@`.

**Syntax:**
```
TableName.FieldName.AnnotationName@ value
```

**Example:**
```
Person> Id%, FirstName, LastName, Email
Person.Email.Required@ true
Person.Email.Pattern@ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
Person.FirstName.MaxLength@ 50
```

**Rules:**
- Annotations should be defined after the entities they annotate
- Annotation values are freeform strings
- Common annotations: Required, MaxLength, MinLength, Pattern, Description, DisplayName

---

## Complete Example

```
# System annotations
Version@ 2.0.0
Author@ Development Team

# Enums
Status? draft, published, archived
Priority? low, medium, high

# Tables
User> Id%, Username, Email, IsActive?
Category> Id%, Name, ~Status
Post> Id%, {User.Id, {Category.Id, Title, Content, ~Priority, PublishedAt#@

# Lookup Display Formats
User& "{Username} ({Email})"
Category& "{Name}"
Post& "{Title}"

# Table annotations
Post.Description@ Blog posts written by users
Post.DisplayName@ Blog Posts

# Field annotations
User.Email.Required@ true
User.Email.Pattern@ ^[^\s@]+@[^\s@]+\.[^\s@]+$
Post.Title.MaxLength@ 200
Post.Content.Required@ true

# Initial data
User+ admin, admin@example.com, true|admin
Category+ Announcements, published|announcements
Post+ [admin], [announcements], Welcome Post, Welcome to our platform!, high, 2024-01-01 10:00:00
```

---

## Parsing Order

When processing a CTS file, constructs should be parsed in the following order:

1. System annotations
2. Enum definitions
3. Table definitions
4. Lookup definitions
5. Table annotations
6. Field annotations
7. Record definitions

This order ensures that all referenced entities exist before they are used.

---

## Best Practices

1. **Group related definitions**: Keep related enums, tables, and annotations together
2. **Use meaningful names**: Table and field names should be self-documenting
3. **Define parent tables first**: Always define parent tables before child tables
4. **Capture primary keys**: Use variable names when inserting records that will be referenced
5. **Comment your schema**: Use `#` for single-line comments
6. **Be consistent**: Use consistent naming conventions throughout your schema
7. **Validate data types**: Ensure record values match the expected field types
