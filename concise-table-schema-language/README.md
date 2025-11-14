# Concise Table Schema Language

CTS is a language for describing database schema as concisely as possible.

This extension enables syntax highlighting for `.cts` files as well as a few code snippets. There are also commands which generate scripts based on the currently active `.cts` file, for example a Postgres SQL table creation script. These commands have the prefix `CTS:`.

## CTS Definition

A table and its fields are defined on a single line, with a `>` character indicating that a table is being defined. For example, it is possible to define a table named `Person` with three fields: A primary key called `Id` (which is an integer), a `FirstName` field and a `LastName` field:

```bash
Person> Id%, FirstName, LastName
```

The first field in a table is always its primary key. You can see how the `Id` column has a `%` suffix, which is the suffix used to identify the column as an integer field. By default fields are of type `String`. The following suffixes are available:

| Suffix | Type | Example |
|---|---|---|
| (none) | String | `FullName` |
| ? | Boolean | `IsOnline?` |
| % | Long | `PercentComplete%` |
| $ | Double | `BankBalance$` |
| # | Date | `DateOfBirth#` |
| @ | Time | `StartTime@` |
| #@ | Date and Time | `LastModified#@` |
| * | BLOB | `UploadedDocument*` |

Arrays are denoted by adding `[]` to the end of the definition, for example `FullName[]` and `StartTime@[]`.

It is also possible to define enum types (via `?`) and use them for specific fields:

```bash
Gender? male, female, other, unknown
Person> Id%, FirstName, LastName, Gender~Gender
```

The above adds a `Gender` field to the `Person` table, where the value can be `male`, `female`, `other` or `unknown`.

Fields can also reference other tables or types via field definitions that follow the format `Name{ParentTableName.ParentFieldName`, `Name~RelatedTableName.RelatedFieldName` or `Name~EnumTypeName`:

```bash
Maturity? alpha, beta, release
Visibility? visible, hidden
Group> Id%, Title
Product> Id%, {Group.Id, Name, ~Maturity, ~Visibility, Summary, Description, LatestRelease~Release.Id
Release> Id%, {Product.Id, Version, ~Maturity, ReleaseDate#
```

The `LatestRelease` column is a lookup onto the `Release` table (via its `Id` column) and the `Group.Id` and `Product.Id` columns are lookups onto the `Group` and `Product` tables respectively. No name is specified for these columns, so they will simply be named after the tables they reference. The use of `{` creates a parent-child (I.E. one-to-many) relationship between two tables, and the use of `~` creates a many-to-one relationship between two tables.

To solidify this example further, the `{Group.Id` specification on the `Product` table creates a field called `Group` in that table and makes the `Product` table a child table of the `Group` table. The `LatestRelease~Release.Id` specification on the `Product` table creates a field called `LatestRelease` in that table and the value of that column is a reference to a specific record in the `Release` table (I.E. the value of the `Id` column for that record in the `Release` table).

The `Maturity` and `Visibility` entries specify enum types, where a list of possible values are defined. Such types are then referenced in the `Product` table. Though it is possible to specify a name for this field by writing a name before the tilda (`~`), the absence of the prefix means that the name of the field will simply be the name of the enum type.

It is also possible to define core data for a table:

```
Group+ Tools, These utilities make life easier for power users!|tools
Product+ [tools], Postwoman, alpha, visible, A no-nonsense approach to managing collections of API requests. A replacement for Postman.|p
Release+ [p], 1.0, alpha, 2023-12-21
```

This specifies that three records will be inserted, one for each of the following tables: `Group`, `Product`, `Release`. Note the use of names after the pipe (`|`) to specify that the primary key of the newly inserted record should be captured in a variable name. The value of that variable name can then be used via square brackets in subsequent records, thus creating a link between the records.

## Compiling to SQL

You can use the `CTS: Compile to SQL Script (Postgres)` command to compile a CTS to a Postgres SQL file. For example, in the Group / Product / Release example above, the following SQL is generated:

```sql
CREATE TYPE "Maturity" AS ENUM ('alpha', 'beta', 'release');

CREATE TYPE "Visibility" AS ENUM ('visible', 'hidden');

CREATE TABLE "Group" (
    "Id" BIGSERIAL PRIMARY KEY,
    "Title" VARCHAR NULL
);

CREATE TABLE "Product" (
    "Id" BIGSERIAL PRIMARY KEY,
    "GroupId" BIGINT NULL,
    "Name" VARCHAR NULL,
    "Maturity" "Maturity" NULL,
    "Visibility" "Visibility" NULL,
    "Summary" VARCHAR NULL,
    "Description" VARCHAR NULL,
    "LatestRelease" BIGINT NULL,
    CONSTRAINT "Product_GroupId_FKey" FOREIGN KEY ("GroupId") REFERENCES "Group" ("Id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "Product_LatestRelease_FKey" FOREIGN KEY ("LatestRelease") REFERENCES "Release" ("Id") UPDATE RESTRICT ON DELETE SET NULL
);

CREATE TABLE "Release" (
    "Id" BIGSERIAL PRIMARY KEY,
    "ProductId" BIGINT NULL,
    "Version" VARCHAR NULL,
    "Maturity" "Maturity" NULL,
    "ReleaseDate" TIMESTAMP NULL,
    CONSTRAINT "Release_ProductId_FKey" FOREIGN KEY ("ProductId") REFERENCES "Product" ("Id") ON UPDATE CASCADE ON DELETE CASCADE
);
```

## Compiling to TypeScript Interfaces

You can use the `CTS: Compile to Typescript` command to compile a CTS to a Typescript file. For example, in the Group / Product / Release example above, the following SQL is generated:

```typescript
type Maturity = 'alpha' | 'beta' | 'release';

type Visibility = 'visible' | 'hidden';

interface IGroup {
    id: number;
    title: string;
}

interface IProduct {
    id: number;
    groupId: number;
    name: string;
    maturity: string;
    visibility: string;
    summary: string;
    description: string;
    latestRelease: number;
}

interface IRelease {
    id: number;
    productId: number;
    version: string;
    maturity: string;
    releaseDate: string;
}

```

## Full Language Spec

For more details about the full CTS language spec see [LANGUAGE.md](./LANGUAGE.md).

## Code Snippets

You can use the following code snippets in Visual Studio Code:

- `ctst`: CTS Table
- `ctsa`: CTS Annotation
- `ctsd`: CTS Record

## Release Notes

### 1.0.0

Initial release of CTS, just the syntax highlighting along with some code snippets

### 1.1.0

Can now generate a Postgres SQL script from a CTS via the `CTS: Compile to SQL Script (Postgres)` command.

### 1.2.0

Can now generate a set of TypeScript interfaces, each one a representation of a table and its fields via the `CTS: Compile to Typescript` command.