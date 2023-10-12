class Piece {
    constructor(hive, side)
    {
        this.hive = hive
        this.side = side
        this.name = ""
        this.color = 0xCCCCCC
    }

    getMovesFrom(hex)
    {
        return []
    }
}

class Queen extends Piece {
    constructor(hive, side) {
        super(hive, side)
        this.name = "Queen Bee"

        this.color = 0xFCBA03
    }

    getMovesFrom(hex)
    {
        return [hex]
    }
}

class Grasshopper extends Piece {
    constructor(hive, side) {
        super(hive, side)
        this.name = Grasshopper
        this.color = 0x31A843
    }

    getMovesFrom(hex)
    {
        return [hex]
    }
}

class Beetle extends Piece {
    constructor(hive) {
        super(hive)
        this.name = "Beetle"
        this.color = 0xC225AF
    }

    getMovesFrom(hex)
    {
        return [hex]
    }
}

class Spider extends Piece {
    constructor(hive, side) {
        super(hive, side)
        this.name = "Spider"
        this.color = 0xBD3B2F
    }

    getMovesFrom(hex)
    {
        return [hex]
    }
}

class Ant extends Piece {
    constructor(hive, side) {
        super(hive, side)
        this.name = "Soldier Ant"
        this.color = 0x2666B5
    }

    getMovesFrom(hex)
    {
        return [hex]
    }
}

export {Piece, Ant, Spider, Beetle, Grasshopper, Queen}