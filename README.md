![Title Image](ursamu_github_banner.png)

# Ursamu

### A Moden MUSH engine

> **Warning** This project is in it's infancy. The API isn't set in stone, and features are constantly being added and removed on an almost daily basis. Feel free to play with the repo - but be warned that it's likely to change if you decide to update! :)

This _README_ is more of a living notes at the moment.

[Installation](#) <br>
[Configuration](#)<br>
[ECS & Flags](#)<br>
[Services](#)<br>
[Context](#)<br>
[Hooks](#)<br>
[Commands](#)<br>
[Functions](#)<br>
[Plugins & Expansions](#)<br>
[Help](#)

## What Is UrsaMU

UrsaMU us a hat tip to the brilliant people behind the MUSH multi-user text based Roleplaying servers of the mid to late 90's. This project is a personal attempt to recreate that magic, plus add some features that I've always wished MUSHes had by default.

## Installation

## Features

### Command Customization

It's possible to add new commands to the game, or overwrite existing commands! Inside a [module](#) or plugin, you can add new commands to the system through the `mu` object.

```JS
mu.command({
  // This is the name that will show up in the +help
  // index.
  name: "command",
  // What Category the help file should be under.  It
  // defaults to general.  You can also designate a
  // sub-category with a colon, which will populate the
  // See Also: entries.
  category: "ooc:misc",
  // I'm using a template literal here to be fancy, but
  // you can also just use ae regular string and it will
  // work just the same.
  help: `
  SYNTAX: +command <arg>

  This is a help file for my really super keen commmand.
  Ex +command Blah blah more stuff.
  `,
  // The pattern is used on the incoming text string to find
  // matches.  Any capture groups assigned will be given
  // to the `ctx` object.
  pattern: /^\+command\s(.*)?/i,
  // Flags designate who can use the command
  flags: "connected !dark|admin+",
  // When a pattern is matched, and the flags
  // requiernments are met, the command's 'exec'
  // property will be given the contect `ctx` object
  // from the request.
  exec: async (ctx) => {
    // Get the database entries for the enactor and the
    // room they occupy.
    const en = await mu.db.get(ctx.user._id);
    const room = await mu.db.get(en.data.location);

    // Send a message to all users in a room
    ctx.message = "Hey! I totally made a command!";
    mu.send.to(room.data.contents, ctx);
  }
})
```

For more information on the `ctx` object, see the section on [context](#). For help more information on flags, see the [flags](#) and [flag queries](#) sections. For more information about the `mu` object, see the [documentation](#).

### Entity Component System

UrsaMU Uses an ECS pattern to handle it's game objects. With UrsaMU, when you define `flags(components)` to `database objects (entities)` and have the option of designing `scripts (sytems)` to affect them.

#### Flags: Components

Flags allow you to tag database entities. They act as identifiers for everything from command access to in-game statuses. They are a quick way to index and affect any number of flagged objects at once.

Flags are defined either through the `mu` global object, or through editing a yaml file within the server's `./config` folder.

```YML
# From ./config/flags.yml
flags:
  - name: object
    code: o
    lock: immortal
    components:
      name: ""
      desc: ""
      contents: []
      owner: ""
      location: ""
      moniker: ""

  - name: player
      code: P
      lock: wizard+
      components:
        hp: 20
        en: 2
        dmg: 1
        mit: 0
        acc: 0
        eva: 0
        sp:
          current: 0
          total: 0
```

Or a flag can be defined in a plugin:

```JS
module.exports = mu =>
  mu.flags.flag({
    name: "mob",
    code: "M",
    lock: "wizard+",
    components: {
      hp: 20,
      dmg: 1,
      mit: 0,
      acc: 0,
      eva: 0
    }
  })
```

###### Possible `Flag` fields.

- `Name (required)` - the display name of the flag. The system is case insensitive.
- `Code (required)` - The short-code for the flag. This is what will be desplayed next to the object's Database reference for admins and anyone who has permissions to edit the object.
- `Lock` - A string list of flags required or restricted from setting this flag. See [flag queries](#) for more. If this is missing it defaults to anyone being able to set the flag.
- `Description` - A brief description of the flag.
- `Components` - Components are properties and default values that will be added too, or removed from an entity upon setting or removing the flag.

#### flag Queries

UrsaMU offers a little bit of shorthand for manipulating annd checking for flags. Flags can be checked for existance, or not (!). `flag` or `!flag`.

Some flags also carry a level, or player bit (called bitlevel from here on). Adding a plus (+) to the end of a flag checks for that bit level or higher. `wizard+`

Flags can also be checked for `or` statements. IE if any of the flags within the query return true, the entire query returns true. This is done with the pipe `|` character. Ex. `player|mob` Which stands for either the object has either the `player` or the `mob` flags.

Flags can be checked/set as a sequence: `avatar combat approved|npc` Which checks for the avatar and combat flags, then checks to see if the object is approved OR has the NPC flag.

## License

**`MIT`**
