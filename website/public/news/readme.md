# How to add a new news item

1. Add an entry in `_data.json`. Make sure to add this entry at the top so that
posts are sorted reverse chronologically

  The data format is `"slug": { ... news data ... }`. Make sure to not include `.md` in the slug.

  ```
  {
      "hello-world": {
        "postTitle": "Hello World",
        "abstract": "This is a short description about this news post"
      }
  }
  ```

  For a speaker intro post, use this data format:

  ```
  "intro-awesome-speaker": {
      "layout": "_layout_speaker",
      "day": "browser",
      "speakerID": 1,
      "abstract": "..."
  }
  ```

  The best way to find the speakerID is to look at their avatar src and subtract 1.

2. Write your news post. Make it a file in this directory called `hello-world.md`