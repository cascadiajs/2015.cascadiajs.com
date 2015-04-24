# How to add a new news item

1. Add an entry in `_data.json`

The data format is "slug": { title: " " }. Make sure to not include `.md` in the slug.

    {
        "hello-world": {
          "title": "Hello World",
          "abstract": "This is a short description about this news post"
        }
    }

2. Write your news post. Make it a file in this directory called `hello-world.md`

