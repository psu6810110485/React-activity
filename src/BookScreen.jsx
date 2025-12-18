import './App.css'
import { useState, useEffect } from 'react';
import { Divider, Spin } from 'antd';
import axios from 'axios'
import BookList from './components/BookList'
import AddBook from './components/AddBook';
import EditBook from './components/EditBook';

const URL_BOOK = "/api/book"
const URL_CATEGORY = "/api/book-category"

export default function BookScreen() {
  const [bookData, setBookData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editBook, setEditBook] = useState(null);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(URL_CATEGORY);
      setCategories(data.map(cat => ({
        label: cat.name,
        value: cat.id
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(URL_BOOK);
      setBookData(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddBook = async (book) => {
    setLoading(true)
    try {
      await axios.post(URL_BOOK, book);
      fetchBooks();
    } catch (error) {
      console.error('Error adding book:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLikeBook = async (book) => {
    setLoading(true)
    try {
      await axios.patch(URL_BOOK + `/${book.id}`, { likeCount: book.likeCount + 1 });
      fetchBooks();
    } catch (error) {
      console.error('Error liking book:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteBook = async (bookId) => {
    setLoading(true)
    try {
      await axios.delete(URL_BOOK + `/${bookId}`);
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
    } finally {
      setLoading(false);
    }
  }

  const updateBook = async (book) => {
    setLoading(true)
    try {
      const editedData = { ...book, price: Number(book.price), stock: Number(book.stock) }
      const { id, ...data } = editedData
      delete data.category
      delete data.createdAt
      delete data.updatedAt
      await axios.patch(URL_BOOK + `/${id}`, data);
      fetchBooks();
    } catch (error) {
      console.error('Error editing book:', error);
    } finally {
      setLoading(false);
      setEditBook(null);
    }
  }

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, []);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "2em" }}>
        <AddBook categories={categories} onBookAdded={handleAddBook}/>
      </div>
      <Divider>
        My Books List
      </Divider>
      <Spin spinning={loading}>
        <BookList 
          data={bookData} 
          onLiked={handleLikeBook}
          onDeleted={handleDeleteBook}
          onEdit={book => setEditBook(book)}
        />
      </Spin>
      <EditBook 
        item={editBook} 
        categories={categories} 
        isOpen={editBook !== null} 
        onCancel={() => setEditBook(null)} 
        onSave={(formData) => updateBook({ ...editBook, ...formData })} />
    </>
  )
}
