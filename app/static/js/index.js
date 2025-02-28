// helping:

// col: буква
// row: цифра

// constants:

const PATH_TO_FIGURE_IMAGES = "static/images/figures/";

const BLACK = "black";
const WHITE = "white";

// subfunctions:

function getRandomNumber(max, min=0) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

function choiceArrayElement(arr) {
    return arr.length > 0 && arr[getRandomNumber(arr.length)];
}

function remove_class(element, remove_class_name) {
    const class_list = element.className.split(" ");
    let remove_index = class_list.indexOf(remove_class_name);
    if (remove_index === -1) return;
    class_list.pop(remove_index);
    element.className = class_list.join(" ");
}

function get_by_index(arr, obj, k = 0) {
    return arr[arr.indexOf(obj) + k];
}

function change_color(current_color) {
    if (current_color == WHITE) {
        return BLACK;
    }
    return WHITE;
}

// other:

const COLOR_LIST = new Array();

function set_color_list() {
    let color = "white";

    for (let col = 0; col < 8; col++) {
        COLOR_LIST[col] = new Array();

        for (let row = 0; row < 8; row++) {
            COLOR_LIST[col][row] = color;
            if (color == "white") {
                color = "black";
            } else {
                color = "white";
            }
        }

        if (color == "white") {
            color = "black";
        } else {
            color = "white";
        }
    }
}

set_color_list();

// cells:

class Move {
    constructor(prev_cell, next_cell, figure) {
        this.prev_cell = prev_cell;
        this.next_cell = next_cell;
        this.figure = figure;
        this.game = figure.chessboard.game;
        // this.prev_allowed_moves = figure.move_manager.get_allowed_moves()
    }

    move() {
        this.next_cell.move(this.figure);
        this.next_allowed_moves = this.figure.move_manager.get_allowed_moves();
    }
}

class Cell {
    selected_figure_class_dict = {
        white: "yellow",
        black: "yellow",
    };

    allowed_move_class = "allowed-move";

    figure = null;

    constructor(col, row) {
        this.col = col;
        this.row = row;
        this.td = document.createElement("td");
        this.div = document.createElement("div");
        this.td.appendChild(this.div);
        this.set_color();
        this.set_selected_figure_class();
        this.set_class_name();
        this.element = this.td;
    }

    set_selected_figure_class() {
        this.selected_figure_class =
            this.selected_figure_class_dict[this.color];
    }

    set_color() {
        this.color = COLOR_LIST[this.col][this.row];
    }

    get_color() {
        return this.color;
    }

    get_position() {
        return `${this.col}-${this.row}`;
    }

    set_class_name() {
        this.div.className = `cell ${this.color} col-${this.row} row-${this.col} `;
    }

    is_empty() {
        if (this.figure !== null) {
            return false;
        }
        return true;
    }

    get_figure() {
        return this.figure;
    }

    add_figure(figure) {
        if (!this.is_empty()) {
            console.log("not empty");
            this.div.removeChild(this.figure.element);
        }
        this.figure = figure;
        this.figure.cell = this;
        this.div.appendChild(figure.img);
        return this;
    }

    move(figure) {
        figure.cell.div.removeChild(figure.element);
        figure.cell.figure = null;
        this.add_figure(figure);
    }
}

class BlackCell extends Cell {
    selected_figure_class = "orange";

    constructor(col, row) {
        super(col, row);
    }
}

class WhiteCell extends Cell {
    selected_figure_class = "yellow";

    constructor(col, row) {
        super(col, row);
    }
}

// let el = document.getElementById('d')
// el.classList.remove()

// chessboards:

class Chessboard {
    row_list = [];
    col_list = [];
    cell_list = [];
    figure_list = [];
    selected_figure = null;
    element = document.getElementById("chessboard-table");
    allowed_moves_listeners = {};

    constructor(game) {
        this.game = game;
        this.add_cells();
        this.add_to_doc();
    }

    deselect_figure() {
        if (this.selected_figure === null) return;
        this.selected_figure.element.classList.remove(
            this.selected_figure.cell.selected_figure_class
        );
        const prev_allowed_moves =
            this.selected_figure.move_manager.get_allowed_moves();
        for (let cell of prev_allowed_moves) {
            cell.div.classList.remove(cell.allowed_move_class);
            cell.element.removeEventListener(
                "click",
                this.allowed_moves_listeners[cell.get_position()]
            );
            // cell.element.removeEventListener('click',
            //     this.allowed_moves_listeners[cell.get_position()]
            // )
        }
        this.selected_figure = null;
        this.allowed_moves_listeners = {};
    }

    create_allowed_moves_listeners(self, allowed_moves) {
        let allowed_moves_listeners = self.allowed_moves_listeners;
        var listener = function () {
            for (let cell of allowed_moves) {
                cell.element.removeEventListener(
                    "click",
                    allowed_moves_listeners[cell.get_position()]
                );
                cell.div.classList.remove(cell.allowed_move_class);
                if (cell.element == this) {
                    self.selected_figure.move_manager.move_to_another_cell(
                        cell
                    );
                    self.deselect_figure();
                }
            }
            console.log(allowed_moves_listeners);
        };
        return listener;
    }

    select_figure(figure) {
        this.deselect_figure();
        this.selected_figure = figure;
        figure.element.classList.add(figure.cell.selected_figure_class);
        const allowed_moves = figure.move_manager.get_allowed_moves();

        for (let cell of allowed_moves) {
            var listener = this.create_allowed_moves_listeners(
                this,
                allowed_moves
            );
            cell.element.addEventListener("click", listener);
            this.allowed_moves_listeners[cell.get_position()] = listener;
            cell.div.classList.add(cell.allowed_move_class);
        }

        // console.log(this.allowed_moves_listeners)
    }

    add_cells() {
        for (let row = 0; row < 8; row++) {
            this.row_list[row] = [];

            for (let col = 0; col < 8; col++) {
                let cell = new Cell(col, row);
                this.row_list[row].push(cell);
            }
        }

        for (let row = 0; row < 8; row++) {
            this.col_list[row] = [];
            for (let col = 0; col < 8; col++) {
                const cell = this.row_list[col][row];
                this.col_list[row].push(cell);
            }
        }
    }

    create_row(col) {
        let tr = document.createElement("tr");
        tr.className = `row`;
        tr.id = `row-${col}`;
        return tr;
    }

    add_to_doc() {
        let tr_row;
        for (let col = 0; col < 8; col++) {
            tr_row = this.create_row(col);
            for (let row = 0; row < 8; row++) {
                // console.log(this.row_list, this.col_list)
                tr_row.appendChild(this.row_list[col][row].element);
            }
            this.element.appendChild(tr_row);
        }
    }

    get_cell(row, col) {
        return this.row_list[row][col];
    }

    get_col_by_num(col) {
        return this.col_list[col];
    }

    get_col_by_figure(figure) {
        return this.get_col_by_num(figure.cell.col);
    }

    get_row_by_num(num) {
        return this.row_list[num];
    }

    get_row_by_figure(figure) {
        return this.get_row_by_num(figure.cell.row);
    }

    get_king(color) {
        this.game.get_king(color);
    }

    get_black_king() {
        this.game.get_black_king();
    }

    get_white_king() {
        this.game.get_white_king();
    }
}

// ..........      ...        .........     ...        ...    ..........       ...........         .....
// ..........      ...       ..........     ...        ...    ...       ..     ...........       ...
// ...                      ...             ...        ...    ...        ..    ...             ...
// ...             ...     ...              ...        ...    ...       ..     ...            ...
// ..........      ...    ...               ...        ...    ..........       ...........     ...
// ..........      ...    ...     ......    ...        ...    .......          ...........       ...
// ...             ...     ...       ...     ...      ...     ...   ...        ...                 ...
// ...             ...      ...     ...       ...    ...      ...     ...      ...                  ...
// ...             ...       .........         ...  ...       ...      ...     ...........         ...
// ...             ...        ....               ...          ...       ...    ...........     .....

// base for figures:

// base for move managers:

class MoveManager {
    select_figure_listener = null;

    completed_moves = [];
    allowed_cell_list = [];

    vertical_movement = false;
    horizontal_movement = false;
    diagonal_movement = false;

    move_patterns = [];
    attack_patterns = [];
    first_move_patterns = [];

    constructor(figure) {
        this.chessboard = figure.chessboard;
        this.game = this.chessboard.game;
        this.figure = figure;
        this.cell = figure.cell;
        this.add_select_figure_listener(this);
    }

    add_select_figure_listener(self) {
        // const self = this
        this.select_figure_listener = function () {
            if (self.figure.is_selected()) return;
            self.figure.select();
        };
        self.figure.element.addEventListener(
            "click",
            self.select_figure_listener
        );
    }

    move_to_another_cell(new_cell) {
        const move = new Move(this.figure.cell, new_cell, this.figure);
        move.move();
        this.chessboard.game.change_current_move(move);
        console.log(this.chessboard.game.current_move);
        this.completed_moves.push(new_cell);
    }

    shah_posible(to_cell) {
        const king = this.chessboard.get_king(this.figure.color);
        const move = new Move(this.cell, to_cell, this.figure);
        return false;
    }

    processing_allowed_moves(allowed_moves) {
        const pop_cells = [];
        for (let cell of allowed_moves) {
            if (this.shah_posible(cell)) {
                pop_cells.push(cell);
            }
        }
        for (let pop_cell of pop_cells) {
            allowed_moves.pop(allowed_moves.indexOf(pop_cell));
        }
    }
}

class Figure {
    name = null;
    path_to_image = null;
    element = null;
    color = null;
    img = null;
    img_width = 80;
    img_height = 80;
    cell = null;
    class_name = " figure ";
    can_move = true;

    constructor(chessboard, cell) {
        this.chessboard = chessboard;
        this.cell = cell;
    }

    create_element() {
        const element = document.createElement("img");
        element.className = this.class_name;
        element.src = this.path_to_image;
        element.width = this.img_width;
        element.height = this.img_height;
        this.img = element;
        return element;
    }

    is_selected() {
        console.log(this);
        return this.chessboard.selected_figure === this;
    }

    deselect() {}

    select() {
        if (this.chessboard.game.current_move !== this.color) return;
        this.chessboard.select_figure(this);
        // const allowed_moves=this.move_manager.get_allowed_moves()
    }
}

// pawn figures:

class PawnMoveManager extends MoveManager {
    get_allowed_moves(ignored_figure = null) {
        this.capturing_on_aisle();
        const allowed_moves = [];

        const col_list = this.figure.chessboard.col_list;

        let cur_row_num = this.figure.cell.row;
        let cur_col_num = this.figure.cell.col;

        let posible_cell;
        let row_pos, col_pos;

        let patterns;
        if (this.completed_moves.length == 0) {
            patterns = [
                ...this.move_patterns.slice(0),
                ...this.first_move_patterns.slice(0),
            ];
        } else {
            patterns = this.move_patterns.slice(0);
        }

        for (let pos of patterns) {
            col_pos = pos[0] + cur_col_num;
            row_pos = pos[1] + cur_row_num;
            if (col_pos > 7 || col_pos < 0 || row_pos > 7 || row_pos < 0)
                continue;
            posible_cell = col_list[col_pos][row_pos];
            if (posible_cell && posible_cell.is_empty()) {
                allowed_moves.push(posible_cell);
            } else if (!posible_cell.is_empty()) {
                break;
            }
        }

        for (let pos of this.attack_patterns) {
            col_pos = pos[0] + cur_col_num;
            row_pos = pos[1] + cur_row_num;
            if (col_pos > 7 || col_pos < 0 || row_pos > 7 || row_pos < 0)
                continue;
            posible_cell = col_list[col_pos][row_pos];
            if (posible_cell.is_empty()) {
            } else if (posible_cell.figure.color != this.figure.color) {
                allowed_moves.push(posible_cell);
            }
        }
        console.log(allowed_moves);

        return allowed_moves;
    }

    capturing_on_aisle() {
        if (this.game.move_history.length === 0) return;
        const last_move_idx = this.game.move_history.length - 1;
        const last_move = this.game.move_history[last_move_idx];
        if (last_move.figure.color == this.figure.color) return;
        if (last_move.figure.name != "pawn") return;
        if (last_move.figure.move_manager.completed_moves.length != 1) return;
        if (last_move.figure.cell.row != this.figure.cell.row) return;
        let last_move_col = last_move.figure.cell.col;
        let this_move_col = this.figure.cell.col;
        if (last_move_col - this_move_col == 1) {
            console.log("right");
        } else if (this_move_col - last_move_col == 1) {
            console.log("left");
        } else {
            return;
        }

        console.log(last_move.figure.cell);
    }

    move_to_another_cell(new_cell) {
        super.move_to_another_cell(new_cell);
        if (new_cell.row == 0 || new_cell.row == 7) {
            new PawnTransform(this.figure);
        }
    }
    constructor(figure) {
        super(figure);
    }
}

class Pawn extends Figure {
    name = "pawn";
    constructor(chessboard, cell, color) {
        super(chessboard, cell);
        this.color = color;
        this.path_to_image =
            PATH_TO_FIGURE_IMAGES + `${this.color}/${this.name}.png`;
        this.class_name = this.class_name + ` figure-${this.color} `;
        this.element = this.create_element();
        this.cell.add_figure(this);
    }
}

class WhitePawnMoveManager extends PawnMoveManager {
    first_move_patterns = [[0, -2]];

    move_patterns = [[0, -1]];
    attack_patterns = [
        [-1, -1],
        [1, -1],
    ];

    constructor(figure) {
        super(figure);
        this.allowed_moves_list = this.get_allowed_moves();
    }
}

class WhitePawn extends Pawn {
    constructor(chessboard, cell) {
        super(chessboard, cell, "white");
        this.move_manager = new WhitePawnMoveManager(this);
    }
}

class BlackPawnMoveManager extends PawnMoveManager {
    first_move_patterns = [[0, 2]];

    move_patterns = [[0, 1]];
    attack_patterns = [
        [1, 1],
        [-1, 1],
    ];
}

class BlackPawn extends Pawn {
    constructor(chessboard, cell) {
        super(chessboard, cell, "black");
        this.move_manager = new BlackPawnMoveManager(this);
    }
}

// bishops figures:

class BishopMoveManager extends MoveManager {
    move_patterns = [[], [], [], []];
    constructor(figure) {
        super(figure);
        this.set_move_patterns();
    }

    set_move_patterns() {
        for (let i = 1; i < 8; i++) {
            this.move_patterns[0].push([i, i]);
            this.move_patterns[1].push([-i, -i]);
            this.move_patterns[2].push([i, -i]);
            this.move_patterns[3].push([-i, i]);
        }
    }

    get_allowed_moves() {
        const allowed_moves = [];

        const col_list = this.figure.chessboard.col_list;

        let cur_row_num = this.figure.cell.row;
        let cur_col_num = this.figure.cell.col;

        let posible_cell;
        let row_pos, col_pos;

        for (let patterns of this.move_patterns) {
            for (let pos of patterns) {
                col_pos = pos[0] + cur_col_num;
                row_pos = pos[1] + cur_row_num;
                if (col_pos > 7 || col_pos < 0 || row_pos > 7 || row_pos < 0)
                    continue;
                posible_cell = col_list[col_pos][row_pos];
                if (!posible_cell) break;
                if (posible_cell.is_empty()) {
                    allowed_moves.push(posible_cell);
                } else if (posible_cell.figure.color != this.figure.color) {
                    allowed_moves.push(posible_cell);
                    break;
                } else break;
            }
        }
        // console.log(allowed_moves)
        return allowed_moves;
    }
}

class Bishop extends Figure {
    constructor(chessboard, cell, color) {
        super(chessboard, cell);
        this.color = color;
        this.path_to_image = PATH_TO_FIGURE_IMAGES + `${this.color}/bishop.png`;
        this.class_name = this.class_name + ` figure-${this.color} `;
        this.element = this.create_element();
        this.cell.add_figure(this);
    }
}

class WhiteBishopMoveManager extends BishopMoveManager {}

class WhiteBishop extends Bishop {
    constructor(chessboard, cell) {
        super(chessboard, cell, WHITE);
        this.move_manager = new WhiteBishopMoveManager(this);
    }
}

class BlackBishopMoveManager extends BishopMoveManager {}

class BlackBishop extends Bishop {
    constructor(chessboard, cell) {
        super(chessboard, cell, BLACK);
        this.move_manager = new BlackBishopMoveManager(this);
    }
}

// rook figures:

class RookManager extends MoveManager {
    move_patterns = [[], [], [], []];
    constructor(figure) {
        super(figure);
        this.set_move_patterns();
    }

    set_move_patterns() {
        for (let i = 1; i < 8; i++) {
            this.move_patterns[0].push([-i, 0]);
            this.move_patterns[1].push([i, 0]);
            this.move_patterns[2].push([0, -i]);
            this.move_patterns[3].push([0, i]);
        }
    }

    get_allowed_moves() {
        const allowed_moves = [];

        const col_list = this.figure.chessboard.col_list;

        let cur_row_num = this.figure.cell.row;
        let cur_col_num = this.figure.cell.col;

        let posible_cell;
        let row_pos, col_pos;

        for (let patterns of this.move_patterns) {
            for (let pos of patterns) {
                col_pos = pos[0] + cur_col_num;
                row_pos = pos[1] + cur_row_num;
                if (col_pos > 7 || col_pos < 0 || row_pos > 7 || row_pos < 0)
                    continue;
                posible_cell = col_list[col_pos][row_pos];
                if (!posible_cell) break;
                if (posible_cell.is_empty()) {
                    allowed_moves.push(posible_cell);
                } else if (posible_cell.figure.color != this.figure.color) {
                    allowed_moves.push(posible_cell);
                    break;
                } else break;
            }
        }
        // console.log(allowed_moves)
        return allowed_moves;
    }
}

class Rook extends Figure {
    name = "rook";
    constructor(chessboard, cell, color) {
        super(chessboard, cell);
        this.color = color;
        this.path_to_image =
            PATH_TO_FIGURE_IMAGES + `${this.color}/${this.name}.png`;
        this.class_name = this.class_name + ` figure-${this.color} `;
        this.element = this.create_element();
        this.cell.add_figure(this);
    }
}

class WhiteRookManager extends RookManager {}

class WhiteRook extends Rook {
    constructor(chessboard, cell) {
        super(chessboard, cell, WHITE);
        this.move_manager = new WhiteRookManager(this);
    }
}

class BlackRookManager extends RookManager {}

class BlackRook extends Rook {
    constructor(chessboard, cell) {
        super(chessboard, cell, BLACK);
        this.move_manager = new BlackRookManager(this);
    }
}

// knight figure:

class KnightManager extends MoveManager {
    move_patterns = [
        [-1, -2],
        [-1, 2],
        [1, 2],
        [1, -2],
        [-2, -1],
        [-2, 1],
        [2, -1],
        [2, 1],
    ];
    get_allowed_moves() {
        const allowed_moves = [];

        const col_list = this.figure.chessboard.col_list;

        let cur_row_num = this.figure.cell.row;
        let cur_col_num = this.figure.cell.col;

        let posible_cell;
        let row_pos, col_pos;

        let patterns = this.move_patterns;

        for (let pos of patterns) {
            col_pos = pos[0] + cur_col_num;
            row_pos = pos[1] + cur_row_num;
            if (col_pos > 7 || col_pos < 0 || row_pos > 7 || row_pos < 0)
                continue;
            posible_cell = col_list[col_pos][row_pos];
            if (!posible_cell) continue;
            if (posible_cell.is_empty()) {
                allowed_moves.push(posible_cell);
            } else if (posible_cell.figure.color != this.figure.color) {
                allowed_moves.push(posible_cell);
            }
        }

        return allowed_moves;
    }
}

class Knight extends Figure {
    name = "knight";
    constructor(chessboard, cell, color) {
        super(chessboard, cell);
        this.color = color;
        this.path_to_image =
            PATH_TO_FIGURE_IMAGES + `${this.color}/${this.name}.png`;
        this.class_name = this.class_name + ` figure-${this.color} `;
        this.element = this.create_element();
        this.cell.add_figure(this);
    }
}

class WhiteKnightManager extends KnightManager {}

class WhiteKnight extends Knight {
    constructor(chessboard, cell) {
        super(chessboard, cell, WHITE);
        this.move_manager = new WhiteKnightManager(this);
    }
}

class BlackKnightManager extends KnightManager {}

class BlackKnight extends Knight {
    constructor(chessboard, cell) {
        super(chessboard, cell, BLACK);
        this.move_manager = new BlackKnightManager(this);
    }
}

// queen figures:

class QueenManager extends MoveManager {
    move_patterns = [[], [], [], [], [], [], [], []];
    constructor(figure) {
        super(figure);
        this.set_move_patterns();
    }

    set_move_patterns() {
        for (let i = 1; i < 8; i++) {
            this.move_patterns[0].push([-i, 0]);
            this.move_patterns[1].push([i, 0]);
            this.move_patterns[2].push([0, -i]);
            this.move_patterns[3].push([0, i]);
            this.move_patterns[4].push([i, i]);
            this.move_patterns[5].push([-i, -i]);
            this.move_patterns[6].push([i, -i]);
            this.move_patterns[7].push([-i, i]);
        }
    }

    get_allowed_moves() {
        const allowed_moves = [];

        const col_list = this.figure.chessboard.col_list;

        let cur_row_num = this.figure.cell.row;
        let cur_col_num = this.figure.cell.col;

        let posible_cell;
        let row_pos, col_pos;

        for (let patterns of this.move_patterns) {
            for (let pos of patterns) {
                col_pos = pos[0] + cur_col_num;
                row_pos = pos[1] + cur_row_num;
                if (col_pos > 7 || col_pos < 0 || row_pos > 7 || row_pos < 0)
                    continue;
                posible_cell = col_list[col_pos][row_pos];
                if (!posible_cell) break;
                if (posible_cell.is_empty()) {
                    allowed_moves.push(posible_cell);
                } else if (posible_cell.figure.color != this.figure.color) {
                    allowed_moves.push(posible_cell);
                    break;
                } else break;
            }
        }
        // console.log(allowed_moves)
        return allowed_moves;
    }
}

class Queen extends Figure {
    name = "queen";
    constructor(chessboard, cell, color) {
        super(chessboard, cell);
        this.color = color;
        this.path_to_image =
            PATH_TO_FIGURE_IMAGES + `${this.color}/${this.name}.png`;
        this.class_name = this.class_name + ` figure-${this.color} `;
        this.element = this.create_element();
        this.cell.add_figure(this);
    }
}

class WhiteQueenManager extends QueenManager {}

class WhiteQueen extends Queen {
    constructor(chessboard, cell) {
        super(chessboard, cell, WHITE);
        this.move_manager = new WhiteQueenManager(this);
    }
}

class BlackQueenManager extends QueenManager {}

class BlackQueen extends Queen {
    constructor(chessboard, cell) {
        super(chessboard, cell, BLACK);
        this.move_manager = new BlackQueenManager(this);
    }
}

// king figures:

class KingManager extends MoveManager {
    move_patterns = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
    ];
    get_allowed_moves() {
        const allowed_moves = [];

        const col_list = this.figure.chessboard.col_list;

        let cur_row_num = this.figure.cell.row;
        let cur_col_num = this.figure.cell.col;

        let posible_cell;
        let row_pos, col_pos;

        let patterns = this.move_patterns;

        for (let pos of patterns) {
            col_pos = pos[0] + cur_col_num;
            row_pos = pos[1] + cur_row_num;
            if (col_pos > 7 || col_pos < 0 || row_pos > 7 || row_pos < 0)
                continue;
            posible_cell = col_list[col_pos][row_pos];
            if (!posible_cell) continue;
            if (posible_cell.is_empty()) {
                allowed_moves.push(posible_cell);
            } else if (posible_cell.figure.color != this.figure.color) {
                allowed_moves.push(posible_cell);
            }
        }

        return allowed_moves;
    }
}

class King extends Figure {
    name = "king";
    constructor(chessboard, cell, color) {
        super(chessboard, cell);
        this.color = color;
        this.path_to_image =
            PATH_TO_FIGURE_IMAGES + `${this.color}/${this.name}.png`;
        this.class_name = this.class_name + ` figure-${this.color} `;
        this.element = this.create_element();
        this.cell.add_figure(this);
    }
}

class WhiteKingManager extends KingManager {}

class WhiteKing extends King {
    constructor(chessboard, cell) {
        super(chessboard, cell, WHITE);
        this.move_manager = new WhiteKingManager(this);
    }
}

class BlackKingManager extends KingManager {}

class BlackKing extends King {
    constructor(chessboard, cell) {
        super(chessboard, cell, BLACK);
        this.move_manager = new BlackKingManager(this);
    }
}

// gaming:

const figure_classes = {
    black: {
        pawn: BlackPawn,
        rook: BlackRook,
        knight: BlackKnight,
        bishop: BlackBishop,
        queen: BlackQueen,
        king: BlackKing,
    },
    white: {
        pawn: WhitePawn,
        rook: WhiteRook,
        knight: WhiteKnight,
        bishop: WhiteBishop,
        queen: WhiteQueen,
        king: WhiteKing,
    },
};

function get_figure_class(color, name) {
    return figure_classes[color][name];
}

class PawnTransform {
    element = null;
    element_wrapper = document.getElementById(
        "select-transformation-figure-wrapper"
    );
    h3 = null;
    figure_width = 80;
    figure_height = 80;
    transform_figure_names = ["queen", "rook", "knight", "bishop"];
    img_listeners = {};

    constructor(pawn) {
        this.element = document.createElement("div");
        this.element.id = "select-transformation-figure";
        this.element_wrapper.appendChild(this.element);
        this.h3 = document.createElement("h3");
        this.h3.textContent = "Выберите фигуру:";
        this.element.appendChild(this.h3);
        this.cell = pawn.cell;
        this.figure = this.cell.figure;
        this.chessboard = pawn.chessboard;
        this.create_img_elements();
    }

    create_img_elements() {
        let img;
        for (let name of this.transform_figure_names) {
            img = document.createElement("img");
            img.src =
                PATH_TO_FIGURE_IMAGES + `${this.figure.color}/${name}.png`;
            img.classList.add("selectable-figure");
            img.width = this.figure_width;
            img.height = this.figure_height;
            img.setAttribute("figure_name", name);
            img.setAttribute("color", this.figure.color);
            this.element.appendChild(img);
            var listener = this.create_img_listener(this, img);
            img.addEventListener("click", listener);
            // img.getAttribute()
        }
    }

    create_img_listener(self, img) {
        var listener = function () {
            let color = this.getAttribute("color");
            let name = this.getAttribute("figure_name");
            let figureClass = get_figure_class(color, name);
            let figure = new figureClass(self.chessboard, self.cell);
            console.log(figure);
            // self.cell.figure=null
            // self.cell.add_figure(figure)
            self.img_listeners = {};
            self.element_wrapper.removeChild(self.element);
        };
        self.img_listeners[img] = listener;
        return listener;
    }

    img_listener() {}
}




class ChessGame {
    current_move = WHITE;
    move_history = [];
    all_figure_list = [];
    all_figures_dict = {
        white: [],
        black: [],
    };
    kings = {
        white: null,
        black: null,
    };

    constructor() {
        this.chessboard = new Chessboard(this);
        this.add_all_figures();
    }

    change_current_move(move) {
        this.move_history.push(move);
        console.log(this.move_history);
        this.current_move = change_color(move.figure.color);
    }

    add_figures(cells, figureClass) {
        const figure_list = [];
        let figure;
        for (let cell of cells) {
            figure = new figureClass(this.chessboard, cell);
            figure_list.push(figure);
            this.all_figure_list.push(figure);
            this.all_figures_dict[figure.color].push(figure);
        }
        return figure_list;
    }

    add_pawns(row_number, pawnClass) {
        const row = this.chessboard.get_row_by_num(row_number);
        this.add_figures(row, pawnClass);
    }

    add_white_pawns() {
        this.add_pawns(6, WhitePawn);
    }

    add_black_pawns() {
        this.add_pawns(1, BlackPawn);
    }

    add_bishops() {
        const white_bishop_cells = [
            this.chessboard.row_list[7][2],
            this.chessboard.row_list[7][5],
        ];
        this.add_figures(white_bishop_cells, WhiteBishop);
        const black_bishop_cells = [
            this.chessboard.row_list[0][2],
            this.chessboard.row_list[0][5],
        ];
        this.add_figures(black_bishop_cells, BlackBishop);
    }

    add_rooks() {
        const white_figure_cells = [
            this.chessboard.row_list[7][0],
            this.chessboard.row_list[7][7],
        ];
        this.add_figures(white_figure_cells, WhiteRook);
        const black_figure_cells = [
            this.chessboard.row_list[0][0],
            this.chessboard.row_list[0][7],
        ];
        this.add_figures(black_figure_cells, BlackRook);
    }

    add_knights() {
        const white_figure_cells = [
            this.chessboard.row_list[7][1],
            this.chessboard.row_list[7][6],
        ];
        this.add_figures(white_figure_cells, WhiteKnight);
        const black_figure_cells = [
            this.chessboard.row_list[0][1],
            this.chessboard.row_list[0][6],
        ];
        this.add_figures(black_figure_cells, BlackKnight);
    }

    add_queens() {
        const white_figure_cells = [this.chessboard.row_list[7][3]];
        this.add_figures(white_figure_cells, WhiteQueen);
        const black_figure_cells = [this.chessboard.row_list[0][3]];
        this.add_figures(black_figure_cells, BlackQueen);
    }

    add_kings() {
        const white_figure_cells = [this.chessboard.row_list[7][4]];
        const white_king = this.add_figures(white_figure_cells, WhiteKing)[0];
        this.kings[WHITE] = white_king;
        const black_figure_cells = [this.chessboard.row_list[0][4]];
        const black_king = this.add_figures(black_figure_cells, BlackKing)[0];
        this.kings[BLACK] = black_king;
        // console.log(this.get_black_king(), this.get_white_king())
    }

    add_white_figures() {
        this.add_white_pawns();
    }

    add_black_figures() {
        this.add_black_pawns();
    }

    add_all_figures() {
        this.add_white_figures();
        this.add_black_figures();
        this.add_bishops();
        this.add_rooks();
        this.add_knights();
        this.add_queens();
        this.add_kings();
    }

    get_king(color) {
        return this.kings[color];
    }

    get_black_king() {
        return this.get_king(BLACK);
    }

    get_white_king() {
        return this.get_king(WHITE);
    }

    get_all_figures() {
        const figure_list = [];
        const col_list = this.chessboard.col_list;
        for (let col of col_list) {
            for (let cell of col) {
                if (cell.is_empty()) continue;
                figure_list.push(cell.figure);
            }
        }
        return figure_list;
    }

    get_figure_list_by_color(color) {
        const figure_list = [];
        const col_list = this.chessboard.col_list;
        for (let col of col_list) {
            for (let cell of col) {
                if (cell.is_empty() || cell.figure.color != color) continue;
                figure_list.push(cell.figure);
            }
        }
        return figure_list;
    }

    get_white_figures() {
        return this.get_figure_list_by_color(WHITE);
    }

    get_black_figures() {
        return this.get_figure_list_by_color(BLACK);
    }
}


const figure_classes_by_color=figure_classes

const figure_classes_by_figure_name= {
    'pawn': {
        'black': BlackPawn, 'white': WhitePawn
    }, 
    'rook': {
        'black': BlackRook, 'white': WhiteRook
    }, 
    'knight': {
        'black': BlackKnight, 'white': WhiteKnight
    }, 
    'bishop': {
        'black': BlackBishop, 'white': WhiteBishop
    }, 
    'queen': {
        'black': BlackQueen, 'white': WhiteQueen
    }, 
    'king': {
        'black': BlackKing, 'white': WhiteKing
    }
}

class ChessGame960 extends ChessGame {
    


    add_all_figures() {
        this.add_black_pawns();
        this.add_white_pawns();
        this.add_sorted_figures();
    }

    

    add_sorted_figures() {
        this.sorted_figures_names = shuffle(
            ['rook', 'rook', 'knight', 'knight', 'bishop', 'bishop', 'queen', 'king']
        )
        for (let cell_col_idx=0; cell_col_idx<this.sorted_figures_names.length; cell_col_idx++) {
            this.add_figures(
                [this.chessboard.get_cell(0, cell_col_idx)], 
                figure_classes_by_figure_name[this.sorted_figures_names[cell_col_idx]]['black']
            )
            this.add_figures(
                [this.chessboard.get_cell(7, cell_col_idx)], 
                figure_classes_by_figure_name[this.sorted_figures_names[cell_col_idx]]['white']
            )
        }
        
    }
}

let game = new ChessGame960()

const main = document.querySelector("main");

class RandomMove {
    constructor(game) {
        this.game = game;
        this.row_list = game.chessboard.row_list;
        this.create_button_element();
    }

    create_button_element() {
        this.button_element = document.createElement("button");
        this.button_element.style = ``;
        this.button_element.textContent = "Рандомный ход";
        this.button_element.type = "button";
        this.set_button_element_listener();
        main.appendChild(this.button_element);
    }

    set_button_element_listener() {
        this.button_element.addEventListener("click", () =>
            this.button_element_listener()
        );
    }

    button_element_listener() {
        let cur_figure_list =
            this.game.all_figures_dict[this.game.current_move];
        let allowed_figure_list = [];
        for (let figure of cur_figure_list) {
            if (figure.move_manager.get_allowed_moves().length !== 0) {
                allowed_figure_list.push(figure);
            }
        }
        let choiced_figure = choiceArrayElement(allowed_figure_list);
        if (!choiced_figure) return;
        choiced_figure.move_manager.move_to_another_cell(
            choiceArrayElement(choiced_figure.move_manager.get_allowed_moves())
        );
    }
}

const random_move = new RandomMove(game);


class ChangeGame {
    games_dict = {
        'ChessGame': {
            'class': ChessGame,
            'button_text': 'Классические шахматы'

        },
        'ChessGame960': {
            'class': ChessGame960,
            'button_text': 'Шахматы 960'

        },
    }
    default_game = this.games_dict['ChessGame']

    constructor () {
        this.create_element()
    }

    add_change_game_button (game_key) {

    }

    create_element() {
        this.element = document.createElement('div')
        this.element.classList.push('change-game-wrapper')
        main.appendChild(this.element)
    }

}

console.log(game);







