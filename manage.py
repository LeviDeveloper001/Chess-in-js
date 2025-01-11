PATH_TO_INDEX_JS = 'app\static\js\index.js'

def get_file_text(file_name:str, size:int=None):
    with open(file_name, 'r', encoding='utf-8') as file:
        return file.read(size)
    
def write_list_into_file(file_name:str, lst:list):
    with open(file_name, 'w', encoding='utf-8') as file:
        for line in lst:
            write_text=f'{line}\n'
            file.write(write_text)
        

def get_count_chars(char:str, text:str):
    count=0
    for cur_char in text:
        if cur_char==char: count+=1
    return count

def get_code_lines(code):
    lines=code.split('\n')
    code_lines=[]
    for line in lines:
        line = line.strip()
        if len(line)<=5: continue
        if line.startswith('//'): continue
        code_lines.append(line)
    return code_lines

def get_count_code_lines(code:str):
    return len(get_code_lines(code))


def get_short_text(text:str, size:int):
    final_text=''
    for i in range(size):
        final_text+=text[i]
    final_text += '...'
    return final_text



class Statistic:
    path_to_file=PATH_TO_INDEX_JS
    path_to_statistic_file='statistic.txt'
    file_data=dict()

    def __init__(self) -> None:
        self.set_file_text()
        self.set_count_lines()
        self.set_count_code_lines()
        self.write_code_lines_into_statistic_file()
        # self.set_file_data()


    def set_file_text(self):
        file_text=get_file_text(self.path_to_file)
        self.file_text=file_text
        return file_text
    
    def set_count_lines(self):
        count_lines=get_count_chars('\n', self.file_text)+1
        self.count_lines=count_lines
        return count_lines
    
    def set_count_code_lines(self):
        count=get_count_code_lines(self.file_text)
        self.count_code_lines=count
        return count
    
    def write_code_lines_into_statistic_file(self):
        code_lines = get_code_lines(self.file_text)
        write_list_into_file(self.path_to_statistic_file, code_lines)

    def write_statistic_into_file(self):
        write_list_into_file(self.path_to_statistic_file, self.count_code_lines)

    def set_file_data(self):
        self.file_data.update({
            'text': self.file_text,
        })

    def __str__(self) -> str:
        return f'''Statistic:
Text: <<\n{get_short_text(self.file_text, 10)}\n>>
Count all lines: {self.count_lines}
Count code lines: {self.count_code_lines}


'''

    





stat = Statistic()


print(stat)
