import os
path='C:/Users/vilas/Desktop/Important/vilasrhegde.github.io/images/test'
dir_list = os.listdir(path)
 
print("Files and directories in '", path, "' :")
 
# prints all files
print(dir_list)
new_names=dict()
for j in dir_list:
    new_names[j]=j.replace('-min-min','')
print(new_names)


import os
