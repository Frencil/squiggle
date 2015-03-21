import re, csv, datetime, fileinput, traceback

with open('includes/header.html', 'r') as headerfile:
    header = headerfile.read()

with open('includes/footer.html', 'r') as footerfile:
    footer = footerfile.read()

def respliceHeaderFooter(filename, title='', depth='', loadposts=''):

    global header
    use_header = header
    for i, j in ('{$TITLE}', title), ('{$DEPTH}', depth):
        use_header = use_header.replace(i, j)

    global footer
    use_footer = footer
    for i, j in ('{$DEPTH}', depth), ('{$LOADPOSTS}', loadposts):
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

# Apply header and footer to distinct pages
respliceHeaderFooter('index.html', 'Home', '', 'recent')
respliceHeaderFooter('archives/index.html', 'Archives', '../', 'archives')

# Apply header and footer to archived posts
with open("posts.txt", "r") as events:
    reader = csv.reader(events, delimiter=':')
    for row in reader:

        iso = row[0]
        title = row[1]

        try:
            date = datetime.datetime.strptime(iso, "%Y-%m-%d").date()
            filename = 'archives/' + date.strftime("%Y%m%d") + '.html'
            htmltitle = title + ' ~ ' + date.strftime("%Y-%m-%d")
            respliceHeaderFooter(filename, htmltitle, '../', 'nav')         

        except Exception:
            print("Error on ISO: " + iso)
            traceback.print_exc()
            continue

    
