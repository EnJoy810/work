import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import {
  getStudentsByClassId,
  saveStudent,
  updateStudent,
  deleteStudent,
  importStudent,
} from "../../api/student";
import ExcelFormatImg from "../../assets/Excel文件格式.png";
import TxtFormatImg from "../../assets/txt文件格式.png";
import "./ClassManagement.css";

const getStudentName = (record) =>
  record?.name || record?.student_name || record?.studentName || "-";

const getStudentNo = (record) =>
  record?.studentNo || record?.student_no || record?.studentCode || "-";

const deriveGenderValue = (record) => {
  const value =
    record?.gender ??
    record?.gender_flag ??
    record?.genderFlag ??
    record?.sex ??
    record?.is_male ??
    record?.isMale;

  if (typeof value === "boolean") {
    return value;
  }

  if (value === 1 || value === "1") {
    return true;
  }

  if (value === 0 || value === "0") {
    return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["男", "male", "m", "true"].includes(normalized)) {
      return true;
    }
    if (["女", "female", "f", "false"].includes(normalized)) {
      return false;
    }
  }

  return true;
};

const attachRowKey = (list) =>
  list.map((item, index) => {
    const candidate =
      item._rowKey ??
      item.id ??
      item.studentId ??
      item.student_id ??
      item.studentNo ??
      item.student_no ??
      `student-${index}`;
    return { ...item, _rowKey: candidate };
  });

const ClassManagement = () => {
  const { classList, selectedClassId } = useSelector((state) => state.class);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [uploadInfoVisible, setUploadInfoVisible] = useState(false);
  const fileInputRef = useRef(null);

  const currentClass = useMemo(() => {
    if (!classList || !classList.length) {
      return null;
    }
    if (selectedClassId) {
      return (
        classList.find((item) => item.class_id === selectedClassId) ||
        classList[0]
      );
    }
    return classList[0];
  }, [classList, selectedClassId]);

  const loadStudents = useCallback(async () => {
    if (!currentClass?.class_id) {
      setStudents([]);
      return;
    }
    setLoading(true);
    try {
      const response = await getStudentsByClassId(currentClass.class_id);
      const list = Array.isArray(response?.data) ? response.data : [];
      setStudents(attachRowKey(list));
    } catch (error) {
      console.error("获取学生列表失败:", error);
      message.error("获取学生列表失败，请稍后重试");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [currentClass]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const openModal = (record = null) => {
    setEditingStudent(record);
    if (record) {
      form.setFieldsValue({
        name: getStudentName(record) === "-" ? undefined : getStudentName(record),
        studentNo: getStudentNo(record) === "-" ? undefined : getStudentNo(record),
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };


  const closeModal = () => {
    setModalOpen(false);
    setEditingStudent(null);
    form.resetFields();
  };

  const openUploadInfo = () => {
    setUploadInfoVisible(true);
  };

  const closeUploadInfo = () => {
    setUploadInfoVisible(false);
  };

  const handleUploadConfirm = () => {
    setUploadInfoVisible(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const beforeUpload = async (file) => {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const allow = ["txt", "xls", "xlsx"].includes(ext);
    if (!allow) {
      message.error("仅支持 .txt/.xls/.xlsx 文件");
      return Upload.LIST_IGNORE;
    }
    if (file.size > 10 * 1024 * 1024) {
      message.error("文件大小不能超过10MB");
      return Upload.LIST_IGNORE;
    }
    if (ext !== "txt") {
      return true;
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result || "");
          const lines = text.split(/\r?\n/).map((l) => l.trim());
          const errs = [];
          let nonEmpty = 0;
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            nonEmpty++;
            const parts = line.split(/[，,]/).map((s) => s.trim());
            if (parts.length !== 3) {
              errs.push(`第${i + 1}行格式不正确`);
              if (errs.length >= 3) break;
              continue;
            }
            const [name, gender, sno] = parts;
            if (!name) {
              errs.push(`第${i + 1}行姓名为空`);
              if (errs.length >= 3) break;
            }
            if (!["男", "女"].includes(gender)) {
              errs.push(`第${i + 1}行性别必须为男/女`);
              if (errs.length >= 3) break;
            }
            if (!sno) {
              errs.push(`第${i + 1}行学号为空`);
              if (errs.length >= 3) break;
            }
          }
          if (nonEmpty === 0) {
            message.error("txt 文件内容为空");
            resolve(Upload.LIST_IGNORE);
            return;
          }
          if (errs.length) {
            message.error(errs.join("；"));
            resolve(Upload.LIST_IGNORE);
            return;
          }
          resolve(true);
        } catch (e) {
          console.error("txt 读取失败:", e);
          message.error("txt 读取失败");
          resolve(Upload.LIST_IGNORE);
        }
      };
      reader.onerror = () => {
        message.error("txt 读取失败");
        resolve(Upload.LIST_IGNORE);
      };
      reader.readAsText(file, "utf-8");
    });
  };

  const doCustomUpload = async ({ file, onSuccess, onError }) => {
    if (!currentClass?.class_id) {
      message.warning("请先选择班级");
      onError?.(new Error("no-class"));
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("student_file", file);
      const res = await importStudent(fd, currentClass.class_id);
      message.success(res?.message || "导入成功");
      onSuccess?.(res, file);
      loadStudents();
    } catch (err) {
      message.error(err?.message || "导入失败");
      onError?.(err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const result = await beforeUpload(file);
      if (result === Upload.LIST_IGNORE || result === false) return;
      await doCustomUpload({ file });
      setUploadInfoVisible(false);
    } finally {
      e.target.value = "";
    }
  };

  const handleDraggerChange = async (info) => {
    const file = info?.file?.originFileObj || info?.file;
    if (!file) return;
    const result = await beforeUpload(file);
    if (result === Upload.LIST_IGNORE || result === false) return;
    await doCustomUpload({ file });
    setUploadInfoVisible(false);
  };

  const handleSubmit = async () => {
    if (!currentClass?.class_id) {
      message.warning("请先选择班级");
      return;
    }
    try {
      const values = await form.validateFields();
      const payload = {
        student_name: values.name.trim(),
        student_no: values.studentNo.trim(),
        gender: deriveGenderValue(editingStudent),
      };

      if (editingStudent) {
        const updatePayload = {
          ...payload,
          id:
            editingStudent?.id ??
            editingStudent?.studentId ??
            editingStudent?.student_id ??
            null,
          class_id: currentClass.class_id,
        };
        if (updatePayload.id === null || updatePayload.id === undefined) {
          message.error("未找到该学生的ID，请刷新后重试");
          return;
        }
        await updateStudent(updatePayload);
        message.success("学生信息已更新");
      } else {
        await saveStudent(payload, currentClass.class_id);
        message.success("学生已新增");
      }
      closeModal();
      loadStudents();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      console.error("保存学生信息失败:", error);
      message.error("保存学生信息失败，请稍后重试");
    }
  };

  const handleDelete = (record) => {
    const studentNo = getStudentNo(record);
    if (!studentNo || studentNo === "-") {
      message.warning("该学生缺少学号，无法删除");
      return;
    }

    Modal.confirm({
      title: `确认删除学生「${getStudentName(record)}」吗？`,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          await deleteStudent(studentNo);
          message.success("学生已删除");
          loadStudents();
        } catch (error) {
          console.error("删除学生失败:", error);
          message.error("删除失败，请稍后重试");
        }
      },
    });
  };

  const columns = [
    {
      title: "姓名",
      dataIndex: "name",
      render: (_, record) => getStudentName(record),
    },
    {
      title: "学号",
      dataIndex: "studentNo",
      render: (_, record) => getStudentNo(record),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="class-management-page">
      <Card className="class-student-card">
        <div className="class-card-header">
          <h2>班级学生列表</h2>
          <span>
            {currentClass
              ? `${currentClass.name || currentClass.class_name || "当前班级"} · 当前共 ${students.length} 人`
              : "暂无班级数据，请先通过导航栏选择班级"}
          </span>
        </div>

        <div className="class-table-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.xls,.xlsx"
            style={{ display: "none" }}
            onChange={handleFileInputChange}
          />
          <Button
            icon={<UploadOutlined />}
            disabled={!currentClass}
            loading={uploading}
            onClick={openUploadInfo}
            style={{ marginRight: 8 }}
          >
            上传学生名单
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            disabled={!currentClass}
          >
            新增学生
          </Button>
        </div>

        <Modal
          open={uploadInfoVisible}
          onOk={handleUploadConfirm}
          onCancel={closeUploadInfo}
          okText="选择文件"
          cancelText="取消"
          title={null}
          closable={false}
          maskClosable={false}
          width={900}
        >
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              display: "grid",
              gap: 16,
              gridTemplateColumns: "1fr 1fr",
              alignItems: "stretch",
              minHeight: 360,
            }}
          >
            <div>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>Excel 格式示意</div>
              <div style={{ marginBottom: 6, color: "#595959", fontSize: 13 }}>必须要表头</div>
              <img
                src={ExcelFormatImg}
                alt="Excel格式示例"
                style={{ width: "100%", border: "1px solid #f0f0f0", borderRadius: 6 }}
              />
              <div style={{ marginTop: 16, marginBottom: 6, fontWeight: 600 }}>TXT 格式示意</div>
              <div style={{ marginBottom: 6, color: "#595959", fontSize: 13 }}>
                TXT 文件每行一名学生，顺序固定为“姓名，性别，学号”，性别仅限“男/女”，分隔符支持中文逗号（，）或英文逗号（,）。
              </div>
              <img
                src={TxtFormatImg}
                alt="TXT格式示例"
                style={{ width: "100%", border: "1px solid #f0f0f0", borderRadius: 6 }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div style={{ flex: 1, minHeight: 0 }}>
              <Upload.Dragger
                accept=".txt,.xls,.xlsx"
                multiple={false}
                maxCount={1}
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleDraggerChange}
                disabled={!currentClass || uploading}
                style={{ height: "100%" }}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">点击或将文件拖拽到此处上传</p>
                <p className="ant-upload-hint">支持 .txt/.xls/.xlsx，大小≤10MB</p>
              </Upload.Dragger>
              </div>
            </div>
          </div>
        </Modal>

        <Table
          className="class-table-equal"
          columns={columns}
          dataSource={students}
          rowKey={(record) => record._rowKey}
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 名学生`,
          }}
        />
      </Card>

      <Modal
        title={editingStudent ? "编辑学生" : "新增学生"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={closeModal}
        okText="保存"
        cancelText="取消"
      >
        <Form layout="vertical" form={form}>
          <div className="class-form-grid">
            <Form.Item
              name="name"
              label="学生姓名"
              rules={[{ required: true, message: "请输入学生姓名" }]}
            >
              <Input placeholder="请输入学生姓名" />
            </Form.Item>
            <Form.Item
              name="studentNo"
              label="学号"
              rules={[{ required: true, message: "请输入学号" }]}
            >
              <Input placeholder="请输入学号" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassManagement;
