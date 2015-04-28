# How to add a new news item

1. Add an entry in `_data.json`. Make sure to add this entry at the top so that
posts are sorted reverse chronologically

  The data format is `"slug": { ... news data ... }`. Make sure to not include `.md` in the slug.

  ```
  {
      "hello-world": {
        "title": "Hello World",
        "abstract": "This is a short description about this news post"
      }
  }
  ```

  For a speaker intro post, use this data format:

  ```
  "intro-awesome-speaker": {
      "layout": "_layout_speaker",
      "title": "Introducing This Awesome Guy",
      "day": "browser",
      "photo": "browser-02-mugshot.jpg",
      "abstract": "..."
  }
  ```

2. Write your news post. Make it a file in this directory called `hello-world.md`