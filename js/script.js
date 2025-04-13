const main_container = document.getElementById('main-container')
const hidden_container = document.getElementById('hidden-container')
const toggle_edit_button = document.getElementById('toggle-edit')
const save_json_button = document.getElementById('save-json')
const load_json_button = document.getElementById('load-json')
const json_input = document.getElementById('json-input')
const spead_select_button = document.getElementById('spead-select')
const spead_option_container = document.getElementById('spead-option-container')
const spead_options = document.getElementsByClassName('spead-option')

class Info {
    constructor() {
        this.title = ''
        this.key = ''
        this.capo = ''
    }

    save(title_input, key_input, capo_input) {
        this.title = title_input.value
        this.key = key_input.value
        this.capo = capo_input.value

        data_is_change = true
    }

    get_data() {
        return{
            title: this.title,
            key: this.key,
            capo: this.capo
        }
    }

    load_data(data) {
        this.title = data.title
        this.key = data.key
        this.capo = data.capo
    }
}

class Block {
    constructor() {
        this.lyric = ''
        this.chord = ''
    }

    add(row) {
        let new_index = row.blocks.indexOf(this) + 1
        add_block(row, new_index)

        reload_container()

        data_is_change = true
    }

    delete(row) {
        let delete_index = row.blocks.indexOf(this)
        row.blocks.splice(delete_index, 1)

        if(row.blocks.length < 2) {
            reset_blocks(row)
        }

        reload_container()

        data_is_change = true
    }

    save(chord_input, lyric_input) {
        this.chord = chord_input.value
        this.lyric = lyric_input.value

        data_is_change = true
    }

    get_data() {
        return {
            lyric: this.lyric,
            chord: this.chord
        }
    }

    load_data(data) {
        this.lyric = data.lyric
        this.chord = data.chord
    }
}

class Row {
    constructor() {
        this.blocks = [new Block(), new Block()]
    }

    add() {
        let new_index = rows.indexOf(this) + 1
        add_row(new_index)

        reload_container()

        data_is_change = true
    }

    delete() {
        let delete_index = rows.indexOf(this)
        rows.splice(delete_index, 1)

        if(rows.length < 2) {
            reset_rows()
        }

        reload_container()

        data_is_change = true
    }

    get_data() {
        return {
            blocks: Array.from(this.blocks).map(block => block.get_data())
        }
    }

    load_data(data) {
        this.blocks = []
        for(let data_block of data.blocks) {
            let block = new Block()
            block.load_data(data_block)
            this.blocks.push(block)
        }
    }
}

const roots = ['B', 'A#', 'A', 'G#', 'G', 'F#', 'F', 'E', 'D#', 'D', 'C#', 'C']
let info = new Info()
let rows = [new Row(), new Row()]
let edit_is_on = false
let data_is_change = false
let interval = null
let scroll_speed = 5
let scroll_value = 0
let spead_option_is_open = false

const add_block = (row, index) => {
    row.blocks.splice(index, 0, new Block())
}

const add_row = (index) => {
    rows.splice(index, 0, new Row())
}

const reset_blocks = (row) => {
    row.blocks = [new Block(), new Block()]
}

const reset_rows = () => {
    rows = [new Row(), new Row()]
}

const get_new_element = (type, classname) => {
    let new_element = document.createElement(type)
    new_element.className = classname

    return new_element
}

const resize_to_span = (target, span, min_string) => {
    span.textContent = target.value || min_string
    target.style.width = span.offsetWidth + 'px'
}

const resize_to_max = (target, elements) => {
    let widths = Array.from(elements).map(element => element.offsetWidth)
    let max_width = Math.max(...widths)
    target.style.width = max_width + 'px'
}

const add_is_on = (classname) => {
    for(let element of document.getElementsByClassName(classname)) {
        element.className += ' is-on'
    }
}

const remove_is_on = (classname) => {
    for(let element of document.getElementsByClassName(classname)) {
        element.className = element.className.replaceAll(' is-on', '')
    }
}

const reload_toggle_edit = () => {
    if(edit_is_on) {
        toggle_edit_button.className += ' is-on'
        add_is_on('only-edit')
    }
    else {
        toggle_edit_button.className = toggle_edit_button.className.replaceAll(' is-on', '')
        remove_is_on('only-edit')
    }
}

const get_down_chord = (chord) => {
    let new_chord = chord

    for(let root of roots) {
        if(chord.includes(root)) {
            let index = roots.indexOf(root)
            if(index >= 11) {
                index = 0
            }
            else {
                index += 1
            }

            new_chord = chord.replace(root, roots[index])

            break
        }
    }

    return new_chord
}

const get_up_chord = (chord) => {
    let new_chord = chord

    for(let root of roots) {
        if(chord.includes(root)) {
            let index = roots.indexOf(root)
            if(index <= 0) {
                index = 11
            }
            else {
                index -= 1
            }

            new_chord = chord.replace(root, roots[index])

            break
        }
    }

    return new_chord
}

const up_all_chord = () => {
    for(let row of rows) {
        for(let block of row.blocks) {
            block.chord = get_up_chord(block.chord)
        }
    }

    reload_container()
}

const down_all_chord = () => {
    for(let row of rows) {
        for(let block of row.blocks) {
            block.chord = get_down_chord(block.chord)
        }
    }

    reload_container()
}

const reload_container = () => {
    scroll_value = window.scrollY

    main_container.innerHTML = ''
    hidden_container.innerHTML = ''

    let title_input = get_new_element('input', 'title only-edit')
    title_input.type = 'text'
    title_input.placeholder = 'タイトル'
    title_input.value = info.title
    let title_span = get_new_element('span', 'title hidden-span')
    hidden_container.appendChild(title_span)
    resize_to_span(title_input, title_span, title_input.placeholder)

    let key_input = get_new_element('input', 'key only-edit')
    key_input.type = 'text'
    key_input.placeholder = 'キー'
    key_input.value = info.key

    let capo_input = get_new_element('input', 'capo only-edit')
    capo_input.type = 'text'
    capo_input.placeholder = 'カポ'
    capo_input.value = info.capo
    
    title_input.addEventListener('input', () => {
        resize_to_span(title_input, title_span, title_input.placeholder)
        info.save(title_input, key_input, capo_input)
    })
    key_input.addEventListener('input', () => {
        key_input.value = key_input.value.replace(/[^a-zA-Z]/g, '')
        info.save(title_input, key_input, capo_input)
    })
    capo_input.addEventListener('input', () => {
        capo_input.value = capo_input.value.replace(/[^0-9]/g, '')
        info.save(title_input, key_input, capo_input)
    })

    let key_capo_container = get_new_element('div', 'key-capo-container')
    let key_container = get_new_element('div', 'key-container')
    let capo_container = get_new_element('div', 'capo-container')
    let key_label = get_new_element('label', 'key-label only-edit')
    key_label.innerHTML = 'key:'
    let capo_label = get_new_element('label', 'capo-label only-edit')
    capo_label.innerHTML = 'capo:'

    let key_button_container = get_new_element('div', 'key-button-container')
    let key_up_button = get_new_element('button', 'key-button')
    key_up_button.innerHTML = '+'
    let key_down_button = get_new_element('button', 'key-button')
    key_down_button.innerHTML = '-'
    let capo_button_container = get_new_element('div', 'capo-button-container')
    let capo_up_button = get_new_element('button', 'capo-button')
    capo_up_button.innerHTML = '+'
    let capo_down_button = get_new_element('button', 'capo-button')
    capo_down_button.innerHTML = '-'

    key_up_button.addEventListener('click', () => {
        stop_scroll()

        key_input.value = get_up_chord(key_input.value)
        info.save(title_input, key_input, capo_input)
        up_all_chord()
    })
    key_down_button.addEventListener('click', () => {
        stop_scroll()

        key_input.value = get_down_chord(key_input.value)
        info.save(title_input, key_input, capo_input)
        down_all_chord()
    })
    capo_up_button.addEventListener('click', () => {
        stop_scroll()

        capo_input.value = `${+capo_input.value + 1}`
        info.save(title_input, key_input, capo_input)
        down_all_chord()
    })
    capo_down_button.addEventListener('click', () => {
        stop_scroll()

        capo_input.value = `${+capo_input.value - 1}`
        info.save(title_input, key_input, capo_input)
        up_all_chord()
    })
    
    key_label.appendChild(key_input)
    capo_label.appendChild(capo_input)
    key_button_container.appendChild(key_down_button)
    key_button_container.appendChild(key_up_button)
    capo_button_container.appendChild(capo_down_button)
    capo_button_container.appendChild(capo_up_button)
    key_container.appendChild(key_label)
    key_container.appendChild(key_button_container)
    capo_container.appendChild(capo_label)
    capo_container.appendChild(capo_button_container)
    key_capo_container.appendChild(key_container)
    key_capo_container.appendChild(capo_container)

    main_container.appendChild(title_input)
    main_container.appendChild(key_capo_container)

    for(let row of rows) {
        let row_div = get_new_element('div', 'row')
        let add_row_button = get_new_element('button', 'add-row only-edit')
        add_row_button.innerHTML = '+'
        add_row_button.addEventListener('click', () => {
            row.add()
        })

        if(rows.indexOf(row) > 0) {
            let row_inner_1_div = get_new_element('div', 'row-inner-1')
            let row_inner_2_div = get_new_element('div', 'row-inner-2')

            let delete_row_button = get_new_element('button', 'delete-row only-edit')
            delete_row_button.innerHTML = '-'
            delete_row_button.addEventListener('click', () => {
                if(confirm('削除しますか？')) {
                    row.delete()
                }
            })

            for(let block of row.blocks) {
                let block_div = get_new_element('div', 'block')
                let add_block_button = get_new_element('button', 'add-block only-edit')
                add_block_button.innerHTML = '+'
                add_block_button.addEventListener('click', () => {
                    block.add(row)
                })

                if(row.blocks.indexOf(block) > 0) {
                    let block_inner_div = get_new_element('div', 'block-inner')

                    let chord_input = get_new_element('input', 'chord only-edit')
                    chord_input.type = 'text'
                    chord_input.placeholder = 'コード'
                    chord_input.value = block.chord
                    let chord_span = get_new_element('span', 'chord hidden-span')
                    hidden_container.appendChild(chord_span)
                    resize_to_span(chord_input, chord_span, chord_input.placeholder)
                    
                    let lyric_input = get_new_element('input', 'lyric only-edit')
                    lyric_input.type = 'text'
                    lyric_input.placeholder = '歌詞'
                    lyric_input.value = block.lyric
                    let lyric_span = get_new_element('span', 'lyric hidden-span')
                    hidden_container.appendChild(lyric_span)
                    resize_to_span(lyric_input, lyric_span, lyric_input.placeholder)

                    let delete_block_button = get_new_element('button', 'delete-block only-edit')
                    delete_block_button.innerHTML = '-'
                    delete_block_button.addEventListener('click', () => {
                        if(confirm('削除しますか？')) {
                            block.delete(row)
                        }
                    })

                    resize_to_max(delete_block_button, [chord_span, lyric_span])

                    chord_input.addEventListener('input', () => {
                        chord_input.value = chord_input.value.replace(/[^0-9a-zA-Z\-\(\)\/\#]/g, '')
                        resize_to_span(chord_input, chord_span, chord_input.placeholder)
                        block.save(chord_input, lyric_input)
                        resize_to_max(delete_block_button, [chord_span, lyric_span])
                    })
                    lyric_input.addEventListener('input', () => {
                        resize_to_span(lyric_input, lyric_span, lyric_input.placeholder)
                        block.save(chord_input, lyric_input)
                        resize_to_max(delete_block_button, [chord_span, lyric_span])
                    })

                    block_inner_div.appendChild(chord_input)
                    block_inner_div.appendChild(lyric_input)
                    block_inner_div.appendChild(delete_block_button)
                    block_div.appendChild(block_inner_div)
                }
                
                block_div.appendChild(add_block_button)
                row_inner_2_div.appendChild(block_div)
            }
            
            row_inner_1_div.appendChild(row_inner_2_div)
            row_inner_1_div.appendChild(delete_row_button)
            row_div.appendChild(row_inner_1_div)
        }
        
        row_div.appendChild(add_row_button)
        main_container.appendChild(row_div)
    }

    window.scrollTo(0, scroll_value)
    reload_toggle_edit()
}

const save_json = () => {
    let data = {
        info: info.get_data(),
        rows: Array.from(rows).map(row => row.get_data())
    }

    let data_json = JSON.stringify(data, null, 2)

    let blob = new Blob([data_json], { type: 'application/json' })
    let file_name = info.title || 'song'

    Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: file_name + '.json'
    }).click();

    data_is_change = false
}

const load_json = (data) => {
    info.load_data(data.info)
    
    rows = []
    for(let data_row of data.rows) {
        let row = new Row()
        row.load_data(data_row)
        rows.push(row)
    }

    reload_container()

    data_is_change = false
}

const start_scroll = () => {
    interval = setInterval(() => {
        window.scrollBy(0, 1)
    }, 200 / scroll_speed)
}

const stop_scroll = () => {
    clearInterval(interval)
    interval = null
}

const toggle_option = (is_open, option_container) => {
    if(is_open) {
        option_container.style.display = 'flex'
    }
    else {
        option_container.style.display = 'none'
    }
}

window.addEventListener('beforeunload', (e) => {
    if(data_is_change) {
        e.preventDefault()
        e.returnValue = ''
    }
})

toggle_edit_button.addEventListener('click', () => {
    stop_scroll()

    edit_is_on = !edit_is_on
    reload_toggle_edit()
})

save_json_button.addEventListener('click', () => {
    stop_scroll()

    save_json()
})

load_json_button.addEventListener('click', () => {
    stop_scroll()

    if(data_is_change) {
        if(!confirm('保存していない内容は失われます。\nよろしいですか？')) return
    }

    json_input.value = ''
    json_input.click()
})

json_input.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if(!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result)
            load_json(data)
        } catch(error) {
            console.error('Invalid JSON file:', error)
        }
    }

    reader.readAsText(file)
})

main_container.addEventListener('click', (e) => {
    if(!edit_is_on && !e.target.closest('.key-button-container, .capo-button-container')) {
        if(interval) {
            stop_scroll()
        }
        else {
            start_scroll()
        }
    }
})

document.addEventListener('keydown', (e) => {
    if(e.key == ' ' && !edit_is_on) {
        e.preventDefault()

        if(interval) {
            stop_scroll()
        }
        else {
            start_scroll()
        }
    }
})

spead_select_button.addEventListener('click', () => {
    stop_scroll()

    spead_option_is_open = !spead_option_is_open
    toggle_option(spead_option_is_open, spead_option_container)
})

document.addEventListener('click', (e) => {
    if(!e.target.closest('.select-container')) {
        spead_option_is_open = false
        toggle_option(spead_option_is_open, spead_option_container)
    }
})

for(let option of spead_options) {
    option.addEventListener('click', () => {
        scroll_speed = +option.innerHTML
        spead_select_button.innerHTML = 'スクロール速度:' + option.innerHTML

        spead_option_is_open = false
        toggle_option(spead_option_is_open, spead_option_container)
    })
}

reload_container()
