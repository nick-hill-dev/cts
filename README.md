# Concise Table Schema Language

CTS is a language for describing database schema as concisely as possible.

## Example

The following CTS defines two tables.

```bash
Group> Id%, Title, Intro, BackgroundImage*
Product> Id%, {Group.Id, Name, Summary, Description, Icon*
```

Field names can have suffixes to define their types, I.E. `%` is an `integer` field, `*` is a `blob` field...etc. By default, fields are of type `string`.

The `Product` table is a child of the `Group` table.

Additional documentation will be created in due course.

## License

CTS was designed by Nick Hill, who also created all of the artifacts in this repository. They are all released under the MIT license. See LICENSE for more information.