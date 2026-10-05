require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'bookrecs',
    password: process.env.DB_PASSWORD,
    port: 5432,
});

const books = [
    { title: "Fourth Wing", isbn: "9781649374042", rating: 4.56 },
    { title: "Iron Flame", isbn: "9781649374172", rating: 4.36 },
    { title: "Onyx Storm", isbn: "9781649377159", rating: 4.22 },
    { title: "Jasad Heir", isbn: "9780316477864", rating: 4.09 },
    { title: "Jasad Crown", isbn: "9780316478243", rating: 4.36 },
    { title: "The Cruel Prince", isbn: "9780316310277", rating: 4.00 },
    { title: "The Wicked King", isbn: "9780316310321", rating: 4.27 },
    { title: "Queen of Nothing", isbn: "9780316310420", rating: 4.33 },
    { title: "Alchemised", isbn: "9780593972700", rating: 4.30 },
    { title: "Verity", isbn: "9781791392796", rating: 4.28 }
];

async function getBookDataFromOpenLibrary(isbn) {
    const isbnurl = `https://openlibrary.org/isbn/${isbn}.json?jscmd=data`
    const response = await fetch(isbnurl)
    const data = await response.json()
    // console.log(data)

    let seriesname = null;
    let bookno = null;

    if (data.series && data.series.length > 0) {
        const raw = data.series[0];
        const match = raw.match(/^(.*?)\s*[(,#]\s*#?(\d+)/);
        if (match) {
            seriesname = match[1].trim();
            bookno = parseInt(match[2]);
        } else {
            seriesname = raw.trim();
        }
    }
    const descriptionUrl = `https://openlibrary.org${data.works[0].key}.json`
    const desc = await fetch(descriptionUrl)
    const description = await desc.json()

    const authorKey = data.authors ? data.authors[0].key : description.authors[0].author.key
    const authorurl = `https://openlibrary.org${authorKey}.json`
    const res = await fetch(authorurl)
    const body = await res.json()


    return {
        title: data.title,
        series_name: seriesname,
        book_no: bookno,
        number_of_pages: data.number_of_pages,
        cover: data.covers ? data.covers[0] : description.covers?.[0],
        author: body.name,
        book_description: description.description
    }
}

async function getInsertAuthor(name) {
    const authorname = await pool.query('SELECT * FROM authors WHERE name = $1', [name])
    if (authorname.rows.length == 0) {
        const populate = await pool.query('INSERT INTO authors(name) VALUES($1) RETURNING *', [name])
        return populate.rows[0].author_id
    }
    else {
        return authorname.rows[0].author_id
    }
}

async function getInsertSeries(name) {
    if (name == null) {
        return
    }
    const seriesname = await pool.query('SELECT * FROM series WHERE name = $1', [name])
    if (seriesname.rows.length == 0) {
        const populate = await pool.query('INSERT INTO series(name) VALUES($1) RETURNING *', [name])
        return populate.rows[0].series_id
    }
    else {
        return seriesname.rows[0].series_id
    }
}

async function populatebooks() {
    for (const book of books) {
        const exists = await pool.query('SELECT 1 FROM books WHERE external_id = $1', [book.isbn])
        if (exists.rows.length > 0) {
            console.log(`${book.title} already exists, skipping`)
            continue
        }

        const result = await getBookDataFromOpenLibrary(book.isbn)
        const author_id = await getInsertAuthor(result.author)
        const series_id = await getInsertSeries(result.series_name)
        const coverUrl = result.cover ? `https://covers.openlibrary.org/b/id/${result.cover}-L.jpg` : null

        const populate = await pool.query('INSERT INTO books(title,author_id,series_id,book_number_in_series, total_pages,rating, cover_image_url, external_id) VALUES($1, $2, $3, $4,$5,$6,$7,$8)', [result.title, author_id, series_id, result.book_no, result.number_of_pages, book.rating, coverUrl, book.isbn])
    }
}

app.get('/books', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM books');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});


app.listen(3000, async () => {
    console.log('Server is running on http://localhost:3000');
    await populatebooks();
    console.log('Table populated')
});