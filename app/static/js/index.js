// helping:

// col: буква
// row: цифра



// constants:

const PATH_TO_FIGURE_IMAGES = 'static/images/figures/'


// subfunctions:

function remove_class(element, remove_class_name) {
    const class_list=element.className.split(' ');
    let remove_index=class_list.indexOf(remove_class_name);
    if (remove_index===-1) return
    class_list.pop(remove_index)
    element.className=class_list.join(' ')
}

function get_by_index(arr, obj, k=0) {
    return arr[arr.indexOf(obj)+k]
}


// other:

const COLOR_LIST = new Array()

function set_color_list() {
    let color='white';

    for (let col=0; col<8;col++) {

        COLOR_LIST[col] = new Array();

        for(let row=0; row<8; row++) {
            COLOR_LIST[col][row] = color
            if (color=='white') {
                color='black';
            } else {
                color='white';
            }
        }
        
        if (color=='white') {
            color='black';
        } else {
            color='white';
        }

    }
}

set_color_list();


// cells:

class Cell {
    selected_figure_class_dict = {
        'white': 'yellow',
        'black': 'yellow'
    }

    figure=null

    constructor (col, row) {
        this.col=col
        this.row=row
        this.td=document.createElement('td')
        this.div=document.createElement('div')
        this.td.appendChild(this.div)
        this.set_color()
        this.set_selected_figure_class()
        this.set_class_name()
        this.element=this.td
    }

    set_selected_figure_class() {
        this.selected_figure_class=this.selected_figure_class_dict[this.color]
    }

    set_color () {
        this.color=COLOR_LIST[this.col][this.row]
    }

    get_color () {
        return this.color
    }

    get_position() {
        return `${this.col}-${this.row}`
    }

    set_class_name () {
        this.div.className= `cell ${this.color} col-${this.row} row-${this.col} `
    }

    is_empty() {
        if (this.figure!==null) {
            return false
        }
        return true
    }

    get_figure() {
        return this.figure
    }

    add_figure(figure) {
        this.figure=figure
        this.figure.cell=this
        this.div.appendChild(
            figure.img
        )
        return this
    }


}

class BlackCell extends Cell {
    selected_figure_class='orange'

    constructor(col, row) {
        super(col, row)
    }
}

class WhiteCell extends Cell {
    selected_figure_class='yellow'

    constructor(col, row) {
        super(col, row)
    }
}



// let el = document.getElementById('d')
// el.classList.remove()


// chessboards:

class Chessboard {

    constructor () {
        this.element=document.getElementById('chessboard-table')
        this.row_list=[]
        this.col_list=[]
        this.cell_list=[]
        this.add_cells()
        this.add_to_doc()
        this.figure_list=[]
        this.selected_figure=null
    }

    deselect_figure() {
        if (this.selected_figure===null) return
        this.selected_figure.element.classList.remove(
            this.selected_figure.cell.selected_figure_class
        )
        this.selected_figure=null
    }

    select_figure(figure) {
        this.deselect_figure()
        this.selected_figure=figure
        figure.element.classList.add(
            figure.cell.selected_figure_class
        )
        
    }

    add_selected_figure_class(figure) {
        if (!this.selected_figure) return
        this.selected_figure.element.classList.add(

        )
    }

    add_cells() {
        

        for (let row=0;row<8;row++) {

            this.row_list[row]=[]

            for (let col=0; col<8; col++) {
                let cell=new Cell(col, row)
                this.row_list[row].push( cell )



            }
        }

        for (let row=0; row<8; row++) {
            this.col_list[row]=[]
            for (let col=0;col<8;col++) {
                const cell=this.row_list[col][row]
                this.col_list[row].push( cell )
            }
        }

        
    }

    create_row(col) {
        let tr=document.createElement('tr')
        tr.className=`row`
        tr.id=`row-${col}`
        return tr
    }
    
    add_to_doc() {
        let tr_row
        for (let col=0; col<8; col++) {
            tr_row=this.create_row(col);  
            for (let row=0;row<8;row++) {
                // console.log(this.row_list, this.col_list)
                tr_row.appendChild(
                    this.row_list[col][row].element
                )
            }
            this.element.appendChild(tr_row)
        }
        
    }


    get_cell(row, col) {
        return this.row_list[row][col]
    }

    get_col_by_num(col) {
        return this.col_list[col]
    }

    get_col_by_figure(figure) {
        return this.get_col_by_num(figure.cell.col)
    }

    get_row_by_num(num) {
        return this.row_list[num]
    }

    get_row_by_figure(figure) {
        return this.get_row_by_num(figure.cell.row)
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

class Figure {
    path_to_image=null
    element=null
    color=null
    img=null
    img_width=80
    img_height=80
    cell=null
    class_name=' figure '
    can_move=true

    constructor(chessboard, cell) {
        this.chessboard=chessboard
        this.cell=cell
    }

    add_click_listener(self) {

    }

    is_selected() {
        return this.chessboard.selected_figure===this
    }

    deselect() {

    }

    select() {
        this.chessboard.select_figure(this)
    }

}




// base for move managers:

class MoveManager {
    select_figure_listener=null

    completed_moves=[]
    allowed_cell_list=[]

    vertical_movement=false
    horizontal_movement=false
    diagonal_movement=false
    


    constructor (figure) {
        this.chessboard=figure.chessboard
        this.figure=figure
        this.cell=figure.cell
        this.add_select_figure_listener()
    }


    add_select_figure_listener() {
        const self = this
        this.select_figure_listener = function() {
            if (self.figure.is_selected()) return
            self.figure.select()
        }
        this.figure.element.addEventListener('click',
            this.select_figure_listener
        )
    }

    get_allowed_moves(self) {

    }

    move_to_another_cell(new_cell) {
        new_cell.add_figure(this.figure)      
    }
}


// pawn move managers:

class PawnMoveManager extends MoveManager {
    get_allowed_moves(self) {

    }
}

class WhitePawnMoveManager extends PawnMoveManager {

}

class BlackPawnMoveManager extends PawnMoveManager {

    first_move_patterns = [
        [0,2],
    ]

    move_patterns=[
        [0,1],
    ]
    attack_patterns=[
        [1,1], [-1,1]
    ]

    get_allowed_moves() {
        const allowed_moves = []

        const col_list=this.figure.chessboard.col_list
        
        let cur_row_num=this.figure.cell.row
        let cur_col_num=this.figure.cell.col
        
        let posible_cell
        let row_pos, col_pos

        let patterns
        if (this.completed_moves.length==0) {
            patterns = [...this.move_patterns.slice(0), ...this.first_move_patterns.slice(0)]
        } else {
            patterns = this.move_patterns.slice(0)
        }

        for(let pos of patterns)  {
            col_pos = pos[0]
            row_pos = pos[1]
            posible_cell = col_list[col_pos+cur_col_num][row_pos+cur_row_num]
            if (posible_cell.is_empty()) {
                allowed_moves.push(posible_cell)
            }
        }

        return allowed_moves
    }
    
    select_figure() {
        if (this.is_selected) {
            return
        }
        this.is_selected=true
        this.figure.element.removeEventListener('click',
            this.select_figure_listener
        )
    }

    add_select_figure_listener() {
        this.select_figure_listener = () => {
            this.select_figure()
        }
        this.figure.element.addEventListener('click',
            this.select_figure_listener
        )
    }

}



// pawn figures:

class Pawn extends Figure {
    path_to_image=null
    element=null

    constructor(chessboard, cell, color) {
        super(chessboard, cell)
        this.color=color
        this.path_to_image=PATH_TO_FIGURE_IMAGES+ `${this.color}/pawn.png`
        this.class_name=this.class_name + ` figure-${this.color} `
        this.cell=cell
        this.element=this.create_element()
        this.cell.add_figure(this)
        this.add_click_listener(this)
    }

    create_element() {
        const element=document.createElement('img')
        element.className=this.class_name
        element.src=this.path_to_image
        element.width=this.img_width
        element.height=this.img_height
        this.img=element
        return element
    }

    click_listener(figure) {
        
    }

}

class WhitePawn extends Pawn {
    constructor(chessboard, cell) {
        super(chessboard, cell, 'white')
        this.move_manager = new WhitePawnMoveManager(this)
    }
    
}

class BlackPawn extends Pawn {
    constructor(chessboard, cell) {
        super(chessboard, cell, 'black')
        this.move_manager = new BlackPawnMoveManager(this)
    }

    
}







// gaming:

class ChessGame {
    
    constructor() {
        this.chessboard=new Chessboard()
        this.add_all_figures()
    }

    add_figures(cells, figureClass) {
        for(let cell of cells) {
            new figureClass(this.chessboard, cell)
        }
    }

    add_pawns(row_number, pawnClass) {
        const row=this.chessboard.get_row_by_num(row_number)
        this.add_figures(row, pawnClass)
    }

    add_white_pawns() {
        this.add_pawns(6, WhitePawn)
    }

    add_black_pawns() {
        this.add_pawns(1, BlackPawn)
    }

    add_white_figures() {
        this.add_white_pawns()
    }

    add_black_figures() {
        this.add_black_pawns()
    }

    add_all_figures() {
        this.add_white_figures()
        this.add_black_figures()
    }

}


const game=new ChessGame()
console.log(game)
