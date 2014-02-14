# Modern theme

Theme for [slide-em-up](https://github.com/nono/slide-em-up)

This theme is based on [Bright Theme](https://github.com/shower/bright).

# Installation

0. `cd /tmp`
1. `git clone url modern`
2. `cd modern`
2. `sass --update styles:css`
2. `mkdir ~/.slide-em-up`
3. `cp -r modern ~/.slide-em-up/modern`
4. `mkdir ~/presentation`
5. `cd ~/presentation`
6. `mkdir main`
7. `vim main/slides.md`
```sh
cat > main/slides.md <<EOF
!SLIDE
# My first slide

* First bullet point
EOF
```
8. Create presentation.json
```sh
cat > presentation.json <<EOF
{
  "title": "My first presentation",
  "theme": "modern",
  "duration": 20,
  "sections": {
    "main": "Title of my main section"
  }
}
EOF
```
9. `gem install slide-em-up`
10. `slide-em-up`
11. Open your browser on http://localhost:9000

# Usage

```html
!SLIDE chapter
!SLIDE section
!SLIDE shout [up|right]
!SLIDE cover [w|h|wh]
```
