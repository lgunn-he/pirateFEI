#!/bin/bash

cat display

if [ $# -lt 1 ]; then
    echo "I need a link matey! And the second arg will be a file name, if it tickles yer fancy!"
    exit
elif [ $# -gt 2 ]; then
    echo "One at a time lad!"
    exit
fi

echo "Fetching data..."
filenr="$(node index.js $1)"
count=0
echo "Done..."

if [ -z "${filenr}" ];then
    echo "Shiver meh timbers! An Error occured! (Won't tell you what though)"
    exit 1
fi
echo "Data fetched successfully..."

echo "Preparing conversion..."
if [ $# -eq 2 ]; then
    filename="$2"
else
    filename="output"
fi

echo -n "" > streamlist.txt

while [ $count -le $filenr ]; do
    echo "file 'output${count}.ts'" >> streamlist.txt
    count=$((count + 1))
done

echo "Converting..."
ffmpeg -f concat -i streamlist.txt -c copy final.ts > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Conversion failed!"
    exit 2
fi
echo "Building output..."
ffmpeg -i final.ts -c copy "$filename.mp4" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Failed to create output!"
    exit 3
fi
echo "Output built successfully!"
echo "Cleaning up..." 
rm *.ts
echo "Done!"
