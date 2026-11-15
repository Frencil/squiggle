#!/usr/bin/python

import re, csv, datetime, fileinput, traceback

with open('includes/header.html', 'r') as headerfile:
    header = headerfile.read()

with open('includes/footer.html', 'r') as footerfile:
    footer = footerfile.read()

def respliceHeaderFooter(filename, title='', depth='', loadposts=''):

    global header
    use_header = header
    for i, j in ('{$DEPTH}', depth), ('{$HOME}', depth or './'), ('{$TITLE}', title):
        use_header = use_header.replace(i, j)

    global footer
    use_footer = footer
    for i, j in ('{$DEPTH}', depth), ('{$HOME}', depth or './'), ('{$LOADPOSTS}', loadposts):
        use_footer = use_footer.replace(i, j)

    doctype = True
    writing = False

    newhtml = ''
    markers = { 'bh': False, 'eh': False, 'bf': False, 'ef': False }

    with open(filename, 'r') as f:

        for line in f:

            # Always write the doctype from here first
            if doctype:
                newhtml += '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">\n'
                doctype = False
            else:
                # React to header/footer comments to toggle writing from source
                if '<!-- BEGIN HEADER -->' in line:
                    if (markers['bh']):
                        raise Exception('Found extraneous <!-- BEGIN HEADER -->')
                    else:
                        markers['bh'] = True
                    newhtml += '<!-- BEGIN HEADER -->\n'
                    newhtml += use_header
                    writing = False
                elif '<!-- END HEADER -->' in line:
                    if (markers['eh']):
                        raise Exception('Found extraneous <!-- END HEADER -->')
                    else:
                        markers['eh'] = True
                    newhtml += '<!-- END HEADER -->\n'
                    writing = True
                elif '<!-- BEGIN FOOTER -->' in line:
                    if (markers['bf']):
                        raise Exception('Found extraneous <!-- BEGIN FOOTER -->')
                    else:
                        markers['bf'] = True
                    newhtml += '<!-- BEGIN FOOTER -->\n'
                    newhtml += use_footer
                    writing = False
                elif '<!-- END FOOTER -->' in line:
                    if (markers['ef']):
                        raise Exception('Found extraneous <!-- END FOOTER -->')
                    else:
                        markers['ef'] = True
                    newhtml += '<!-- END FOOTER -->\n'
                    writing = False
                elif writing:
                    newhtml += line

    if not (markers['bh'] and markers['eh'] and markers['bf'] and markers['ef']):
        raise Exception('Expected markers not found')

    with open(filename, 'w') as f:
        f.write(newhtml)

    print("Wrote " + filename + " :: " + title)

# Folders symlinked inside archives/ (archives/img -> ../img, etc.), so paths
# into them resolve the same from archives/ and from the site root.
SHARED_DIRS = ('img', 'css', 'js')

def rebaseArchiveUrl(url):
    """Rewrite a URL written relative to archives/ so it works from the site root."""
    if (not url or url.startswith(('#', '/', '?', '{'))
            or re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', url)):  # http:, mailto:, javascript:, ...
        return url
    if url.startswith('../'):
        return url[3:] or './'
    if url.startswith('./'):
        url = url[2:]
    if url.split('/')[0] in SHARED_DIRS:
        return url
    return 'archives/' + url

def rebaseArchiveHtml(html):
    """Apply rebaseArchiveUrl to every href/src/poster attribute and CSS url()."""
    html = re.sub(r'''(\b(?:href|src|poster)\s*=\s*)(["'])(.*?)\2''',
                  lambda m: m.group(1) + m.group(2) + rebaseArchiveUrl(m.group(3)) + m.group(2),
                  html, flags=re.I | re.S)
    html = re.sub(r'''(url\(\s*)(["']?)([^)"']*)\2(\s*\))''',
                  lambda m: m.group(1) + m.group(2) + rebaseArchiveUrl(m.group(3)) + m.group(2) + m.group(4),
                  html, flags=re.I)
    return html

def findDivBlock(html, opening):
    """Return (start, end) of the div that begins with `opening`, honoring nested divs."""
    start = html.find(opening)
    if start == -1:
        return None
    depth = 0
    for m in re.finditer(r'<div\b|</div\s*>', html[start:], flags=re.I):
        depth += -1 if m.group(0).startswith('</') else 1
        if depth == 0:
            return start, start + m.end()
    return None

def buildHomePage(latest_filename):
    """Copy the latest post's body into index.html, swapping post nav for Recent Posts."""
    with open(latest_filename, 'r') as f:
        post = f.read()
    try:
        body = post.split('<!-- END HEADER -->\n', 1)[1].split('<!-- BEGIN FOOTER -->', 1)[0]
    except IndexError:
        raise Exception(latest_filename + ': header/footer markers not found')

    nav = findDivBlock(body, '<div id="nav_posts">')
    if nav is None:
        raise Exception(latest_filename + ': <div id="nav_posts"> block not found')
    recent = '<h3>Recent Posts</h3>\n    <div id="recent_posts"></div>'
    body = body[:nav[0]] + recent + body[nav[1]:]
    body = rebaseArchiveHtml(body)

    # Header/footer content is filled in by respliceHeaderFooter afterwards
    with open('index.html', 'w') as f:
        f.write('<!DOCTYPE html>\n<!-- BEGIN HEADER -->\n<!-- END HEADER -->\n'
                + body + '<!-- BEGIN FOOTER -->\n<!-- END FOOTER -->\n')
    print("Built index.html from " + latest_filename)

def archiveFilename(date):
    return 'archives/' + date.strftime("%Y%m%d") + '.html'

# Read the post list
posts = []
with open("posts.txt", "r") as events:
    for row in csv.reader(events, delimiter=':'):
        if not row:
            continue
        try:
            posts.append((datetime.datetime.strptime(row[0], "%Y-%m-%d").date(), row[1]))
        except Exception:
            print("Error on ISO: " + row[0])
            traceback.print_exc()

# Home page shows the most recent post
buildHomePage(archiveFilename(max(posts)[0]))

# Apply header and footer to distinct pages
respliceHeaderFooter('index.html', 'Home', '', 'recent')
respliceHeaderFooter('archives/index.html', 'Archives', '../', 'archives')
respliceHeaderFooter('writing/sparkfun.html', 'SparkFun.com Articles', '../', 'none')

# Apply header and footer to archived posts
for date, title in posts:
    filename = archiveFilename(date)
    try:
        respliceHeaderFooter(filename, title + ' ~ ' + date.strftime("%Y-%m-%d"), '../', 'nav')
    except Exception:
        print("Error on " + filename)
        traceback.print_exc()
