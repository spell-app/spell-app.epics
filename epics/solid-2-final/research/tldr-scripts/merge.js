const groups = require("./tldr-data.js")
const by = Object.fromEntries(groups.map((g) => [g.group[0], g]))
by.speed.items.push(...by.large.items)
by.later.items.unshift(...by.language.items)
by.later.group[1] = "Language, tools, later"
module.exports = groups.filter((g) => g !== by.large && g !== by.language)
