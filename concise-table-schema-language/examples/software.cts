// Option Sets
Maturity? alpha, beta, release
Visibility? visible, hidden

// Tables and Fields
Platform> Id%, Name
Group> Id%, Title, Intro, BackgroundImage*
Product> Id%, {Group.Id, Name, ~Maturity, ~Visibility, Summary, Description, Icon*
ProductTag> Id%, {Product.Id, Tag
ProductScreenshot> Id%, {Product.Id, Name, Caption, File*
ProductLink> Id%, {Product.Id, Label, Url, Summary
Release> Id%, {Product.Id, Version, ~Maturity, ReleaseDate#
ReleaseFile> Id%, {Release.Id, ~Platform.Id, Title, Description, File*

// Lookups
Platform& "{Name}"
Group& "{Title}"
Product& "{Name}"
ProductTag& "{Tag}"
ProductLink& "{Label}"
ProductScreenshot& "{Name}"
Release& "{ProductId.Name} v{Version}"
ReleaseFile& "{ReleaseId.ProductId.Name} v{Release.Version} - {Title}"

// Attributes
Group.Intro.representation@ "textArea"
Product.Description.representation@ "textArea"
ProductLink.Summary.representation@ "textArea"
ReleaseFile.Description.representation@ "textArea"

// Data
Platform+ Windows|windows
Platform+ Linux|linux
Platform+ Android|android
Group+ Tools, These utilities make life easier for power users!|tools
Product+ [tools], Postwoman, alpha, visible, A no-nonsense approach to managing collections of API requests. A replacement for Postman.|p
ProductTag+ [p], Web|
ProductTag+ [p], API|
ProductTag+ [p], Tool|
ProductTag+ [p], Windows|
ProductTag+ [p], REST|
ProductTag+ [p], Developer|
ProductLink+ [p], Postwoman on github.com, https://github.com/nick-hill-dev/postwoman, Source code and documentation.|
Release+ [p], 1.0, alpha, 2023-12-21|r
ReleaseFile+ [r], [windows], Installer, Windows installer, name=installer.msi|
