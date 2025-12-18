import { Button, Form, Select, Input, InputNumber } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AddBook(props) {

  return(
    <Form layout="inline" onFinish={values => {props.onBookAdded({...values})}}>
      <Form.Item name="title" label="Title" rules={[{ required: true }]}>
        <Input/>
      </Form.Item>
      <Form.Item name="author" label="Author" rules={[{ required: true }]}>
        <Input/>
      </Form.Item>
      <Form.Item name="price" label="Price" rules={[{ required: true }]}>
        <InputNumber/>
      </Form.Item>
      <Form.Item name="stock" label="Stock" rules={[{ required: true }]}>
        <InputNumber/>
      </Form.Item>
      <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
        <Select allowClear style={{width:"150px"}} options={props.categories}/>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">New Book</Button>
      </Form.Item>
    </Form>
  )
}