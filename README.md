![Title Image](ursamu_github_banner.png)

# Ursamu

### A Moden MUSH engine

> **Warning** This project is in it's infancy. The API isn't set in stone, and features are constantly being added and removed on an almost daily basis. Feel free to play with the repo - but be warned that it's likely to change if you decide to update! :)

## What Is UrsaMU

UrsaMU us a hat tip to the brilliant people behind the MUSH multi-user text based Roleplaying servers of the mid to late 90's. This project is a personal attempt to recreate that magic, plus add some features that I've always wished MUSHes had by default.

## Installation

## Entity Component System

UrsaMU Uses an ECS pattern to handle it's game objects. With UrsaMU, when you define `flags(components)` to `database objects (entities)` and have the option of designing `scripts (sytems)` to affect them.

### Flags: Components

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

#### Possible `Flag` fields.

- `Name (required)` - the display name of the flag. The system is case insensitive.
- `Code (required)` - The short-code for the flag. This is what will be desplayed next to the object's Database reference for admins and anyone who has permissions to edit the object.
- `Lock` - A string list of flags required or restricted from setting this flag. See [flag queries](#) for more. If this is missing it defaults to anyone being able to set the flag.
- `Description` - A brief description of the flag.
- `Components` - Components are properties and default values that will be added too, or removed from an entity upon setting or removing the flag.

## License

**`MIT`**
