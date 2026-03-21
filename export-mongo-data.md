Export Data: MongoDB provides the mongodump tool for exporting data from a MongoDB server. This tool creates a binary export of the data, including BSON files and metadata.
`mongodump --db sourceDB --out /path/to/dump_directory`

Transfer Dump: Copy the generated dump directory to the destination server, and then use mongorestore to import the data.
`mongorestore --db destDB /path/to/dump_directory`
